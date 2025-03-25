import os
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import chromadb
from chromadb.utils import embedding_functions
import pypdf
from docx import Document
import uuid
import tempfile
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# Add CORS middleware to allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ChromaDB client
client = chromadb.PersistentClient("./chroma_db")

# Use default embedding function
embedding_function = embedding_functions.GoogleGenerativeAiEmbeddingFunction(api_key=os.getenv("GEMINI_API_KEY"))

# Create or get collection
collection = client.get_or_create_collection(
    name="documents", 
    embedding_function=embedding_function
)

class QueryRequest(BaseModel):
    query: str
    n_results: int = 3

class DocumentResponse(BaseModel):
    id: str
    text: str
    metadata: dict
    score: Optional[float] = None

class QueryResponse(BaseModel):
    results: List[DocumentResponse]

def extract_text_from_pdf(file_path):
    """Extract text content from PDF file"""
    text = ""
    with open(file_path, "rb") as f:
        pdf = pypdf.PdfReader(f)
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return text

def extract_text_from_docx(file_path):
    """Extract text content from DOCX file"""
    doc = Document(file_path)
    text = ""
    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"
    return text

def process_document(file_path, file_name, metadata=None):
    """Process document based on file extension"""
    if file_path.lower().endswith('.pdf'):
        return extract_text_from_pdf(file_path)
    elif file_path.lower().endswith('.docx') or file_path.lower().endswith('.doc'):
        return extract_text_from_docx(file_path)
    elif file_path.lower().endswith('.txt'):
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    else:
        raise ValueError(f"Unsupported file format: {file_name}")

def chunk_text(text, chunk_size=1000, overlap=200):
    """Split text into overlapping chunks"""
    chunks = []
    for i in range(0, len(text), chunk_size - overlap):
        chunk = text[i:i + chunk_size]
        if len(chunk) < 50:  # Skip very small chunks
            continue
        chunks.append(chunk)
    return chunks

@app.post("/upload", status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    metadata_json: str = Form("{}")
):
    """Upload and process a document for the knowledge base"""
    # Create temporary file
    suffix = os.path.splitext(file.filename)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        # Write uploaded file to temporary file
        temp_file.write(await file.read())
        temp_path = temp_file.name
    
    try:
        # Process the document
        text = process_document(temp_path, file.filename)
        
        # Chunk the text
        chunks = chunk_text(text)
        
        # Prepare IDs and metadata
        doc_id = str(uuid.uuid4())
        ids = [f"{doc_id}_{i}" for i in range(len(chunks))]
        
        # Add metadata about source
        import json
        metadata_dict = json.loads(metadata_json)
        metadatas = [{
            "source": file.filename,
            "chunk": i,
            "document_id": doc_id,
            **metadata_dict
        } for i in range(len(chunks))]
        
        # Add to ChromaDB
        collection.add(
            documents=chunks,
            ids=ids,
            metadatas=metadatas
        )
        
        return {"message": f"Document '{file.filename}' processed successfully", "document_id": doc_id}
    
    finally:
        # Clean up the temp file
        os.unlink(temp_path)

@app.post("/query", response_model=QueryResponse)
async def query_documents(request: QueryRequest):
    """Query the knowledge base"""
    # Query the collection
    results = collection.query(
        query_texts=[request.query],
        n_results=request.n_results,
    )
    
    # Format the response
    formatted_results = []
    for i in range(len(results["ids"][0])):
        formatted_results.append(
            DocumentResponse(
                id=results["ids"][0][i],
                text=results["documents"][0][i],
                metadata=results["metadatas"][0][i],
                score=results.get("distances", [[]])[0][i] if results.get("distances") else None
            )
        )
    
    return QueryResponse(results=formatted_results)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)