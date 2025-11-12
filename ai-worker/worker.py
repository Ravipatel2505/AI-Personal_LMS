import redis
import os
import json
import time
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import Qdrant
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings

# --- Environment Setup ---
REDIS_HOST = os.getenv('REDIS_HOST', 'redis')
REDIS_CHANNEL = 'file-ingestion'
QDRANT_HOST = os.getenv('QDRANT_HOST', 'qdrant')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# --- Qdrant & Embeddings Setup ---
COLLECTION_NAME = "my_private_lms"
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")


def process_file(file_path, file_id, userId):
    """The core RAG ingestion logic."""
    print(f"[AI Worker] Starting RAG processing for file: {file_id}", flush=True)
    try:
      
        loader = PyPDFLoader(file_path)
        documents = loader.load()
        if not documents:
            print("[AI Worker] Error: No document loaded from PDF.", flush=True)
            return

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        chunks = text_splitter.split_documents(documents)
        
        for chunk in chunks:
            chunk.metadata['file_id'] = str(file_id)
            chunk.metadata['user_id'] = str(userId)

        Qdrant.from_documents(
            documents=chunks,
            embedding=embeddings,
            host=QDRANT_HOST,
            port=6333, 
            collection_name=COLLECTION_NAME,
            prefer_grpc=True
        )
        print(f"[AI Worker] Successfully processed and vectorized file: {file_id}", flush=True)

    except Exception as e:
        print(f"[AI Worker] Error during RAG processing: {e}", flush=True)


def connect_to_redis():
    """Connects to Redis with a retry loop."""
    print("[AI Worker] Worker thread started. Attempting to connect to Redis...", flush=True)
    while True:
        try:
            r = redis.Redis(host=REDIS_HOST, port=6379, db=0, decode_responses=True)
            r.ping() # Test the connection
            print("[AI Worker] Successfully connected to Redis.", flush=True)
            return r
        except redis.exceptions.ConnectionError:
            print("[AI Worker] Redis not ready. Retrying in 5 seconds...", flush=True)
            time.sleep(5)
        except Exception as e:
            print(f"[AI Worker] Error connecting to Redis: {e}", flush=True)
            time.sleep(5)


def start_worker():
    """Connects to Redis and listens for jobs on the channel."""
    
    # This new function will block until Redis is ready
    r = connect_to_redis() 
    
    try:
        p = r.pubsub(ignore_subscribe_messages=True)
        p.subscribe(REDIS_CHANNEL)
        print(f"[AI Worker] Listening for jobs on channel '{REDIS_CHANNEL}'...", flush=True)
        
        for message in p.listen():
            if message['type'] == 'message':
                print("\n---------------------------------", flush=True)
                print("[AI Worker] === JOB RECEIVED ===", flush=True)
                
                job_data = json.loads(message['data'])
                file_path = job_data['filePath']
                file_id = job_data['fileId']
                userId = job_data['userId']
                
                print(f"[AI Worker] Processing file ID: {file_id}", flush=True)
                process_file(file_path, file_id, userId)
                
                print("[AI Worker] === JOB COMPLETE ===", flush=True)
                print("---------------------------------\n", flush=True)

    except Exception as e:
        print(f"[AI Worker] Error in Redis subscriber: {e}", flush=True)

if __name__ == "__main__":
    start_worker()