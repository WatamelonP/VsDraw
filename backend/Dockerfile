FROM python:3.11-slim

WORKDIR /code  # Change this to /code to match the mount

# First, make sure we have the latest pip
RUN pip install --no-cache-dir --upgrade pip

# Copy requirements first (for better caching)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt


COPY ./app /code/app  

# Debug: List installed packages (optional)
RUN pip list

# Debug: Check if uvicorn is installed
RUN which uvicorn || echo "uvicorn not found"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]