# Use an official Python image
FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt ./
# Install the small, CPU-only version of PyTorch first
RUN pip install torch --index-url https://download.pytorch.org/whl/cpu

# Now install the rest of our requirements
RUN pip install --no-cache-dir -r requirements.txt

ENV CACHE_BUSTER=1

# Copy the rest of the application code
COPY . .

# Expose the port Flask runs on
EXPOSE 8000

# The command to start the app
CMD ["python", "app.py"]