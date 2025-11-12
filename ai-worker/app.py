from flask import Flask, jsonify, request
import threading
import worker 
import os
from langchain_groq import ChatGroq
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.chains import RetrievalQA
from langchain_community.vectorstores import Qdrant
import qdrant_client
from qdrant_client.http import models as rest_models

app = Flask(__name__)

# --- Environment & Client Setup ---
QDRANT_HOST = os.getenv('QDRANT_HOST', 'qdrant')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
COLLECTION_NAME = "my_private_lms"

# Initialize clients ONCE when the app starts
# Initialize clients ONCE when the app starts
try:
    # 1. Use free, local embeddings
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    # 2. Connect to Qdrant
    qdrant_client_instance = qdrant_client.QdrantClient(host=QDRANT_HOST, port=6333, prefer_grpc=True)
    vector_store = Qdrant(client=qdrant_client_instance, collection_name=COLLECTION_NAME, embeddings=embeddings)

    # 3. Use the Groq LLM for Q&A
    llm = ChatGroq(
        temperature=0, 
        groq_api_key=os.getenv("GROQ_API_KEY"), 
        model_name="llama-3.3-70b-versatile" # A great, fast model
    )
    
except Exception as e:
    print(f"[AI Worker] Flask API: Error initializing Q&A chain: {e}")
   

# ==================
#      API ROUTES
# ==================

@app.route('/test', methods=['GET'])
def test_connection():
    """A simple test route (from before)."""
    return jsonify({"message": "Hello from the Python AI Worker!"})


@app.route('/query', methods=['POST'])
def handle_query():
    # The old "if not qa_chain:" check is now GONE.

    data = request.json
    question = data.get('question')
    userId = data.get('userId') # We added this

    if not question or not userId:
        return jsonify({"error": "No question or user ID provided."}), 400

    try:
        print(f"[AI Worker] Received query from User: {userId}", flush=True)
        
        # 1. Create a retriever THAT FILTERS by userId
        retriever = vector_store.as_retriever(
            search_kwargs={"filter": {"user_id": userId}}
        )
        
        # 2. Create the Q&A chain on-the-fly
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=retriever,
            return_source_documents=True
        )

        # --- This is the RAG magic ---
        result = qa_chain.invoke({"query": question})

        # Format the sources
        sources = []
        if result.get('source_documents'):
            sources = [
                {
                    "content": doc.page_content,
                    "file_id": doc.metadata.get('file_id', 'unknown'),
                    "page": doc.metadata.get('page', 'unknown')
                }
                for doc in result['source_documents']
            ]

        response = {
            "answer": result.get('result', 'No answer found.'),
            "sources": sources
        }
        
        return jsonify(response)

    except Exception as e:
        import traceback
        print(f"[AI Worker] === QUERY CRASH ===", flush=True)
        print(traceback.format_exc(), flush=True)
        print(f"=========================", flush=True)
        return jsonify({"error": "Internal server error."}), 500

@app.route('/delete-vectors', methods=['POST'])
def handle_delete_vectors():
    """Deletes all vectors associated with a specific file_id."""
    data = request.json
    file_id = data.get('file_id')

    if not file_id:
        return jsonify({"error": "No file_id provided."}), 400

    try:
        print(f"[AI Worker] Deleting vectors for file_id: {file_id}", flush=True)

        # Use the global qdrant_client_instance
        qdrant_client_instance.delete(
            collection_name=COLLECTION_NAME,
            points_selector=rest_models.FilterSelector(
                filter=rest_models.Filter(
                    must=[
                        rest_models.FieldCondition(
                            key="file_id",
                            match=rest_models.MatchValue(value=file_id)
                        )
                    ]
                )
            )
        )

        print(f"[AI Worker] Successfully deleted vectors for file_id: {file_id}", flush=True)
        return jsonify({"message": "Vectors deleted successfully."}), 200

    except Exception as e:
        import traceback
        print(f"[AI Worker] === VECTOR DELETION CRASH ===", flush=True)
        print(traceback.format_exc(), flush=True)
        return jsonify({"error": "Failed to delete vectors."}), 500    

def run_flask_app():
    """Runs the Flask API."""
    app.run(host='0.0.0.0', port=8000)

if __name__ == '__main__':
    # Start the Redis worker in a BACKGROUND thread
    print("Starting AI services...")
    # daemon=True ensures the thread exits when the main app does
    worker_thread = threading.Thread(target=worker.start_worker, daemon=True)
    worker_thread.start()

    # Start the Flask API in the MAIN thread (this is more stable)
    run_flask_app()