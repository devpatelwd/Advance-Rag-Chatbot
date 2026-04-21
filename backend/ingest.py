from google import genai
from dotenv import load_dotenv
import pinecone
import fitz
import tiktoken
import psycopg2
import os
load_dotenv()


pinecone_api = os.getenv("PINECONE_API")
google_api = os.getenv("GEMINI_API_KEY")
conn = psycopg2.connect(os.getenv("DATABASE_URL"))
cursor = conn.cursor()

gemini_client = genai.Client()
pinecone_client = pinecone.Pinecone(api_key=pinecone_api)

index = pinecone_client.Index("ragprac")

def load_pdf(file_bytes):
    pdf = fitz.open(stream=file_bytes , filetype="pdf")

    full_text = ""
    for page in pdf:
        full_text += page.get_text() 

    return full_text


def create_chunks(full_text):

    token_encoder = tiktoken.get_encoding(encoding_name="cl100k_base")

    tokens = token_encoder.encode(full_text)

    chunks = []

    for i in range( 0 , len(tokens) , 150):
        chunk = tokens[i : i + 200]
        decoded_chunk = token_encoder.decode(chunk)
        chunks.append(decoded_chunk)

    return chunks


def get_embeddings(chunks):
    response = gemini_client.models.embed_content(
        model="gemini-embedding-001",
        contents=chunks
    )

    all_embeddings = []

    for embedding in response.embeddings:
        vectors = embedding.values
        all_embeddings.append(vectors)

    return all_embeddings


def ingest(file_bytes , file_name):
    full_text = load_pdf(file_bytes)
    chunks = create_chunks(full_text)
    embeddings = get_embeddings(chunks)

    list_of_embed_tuple = []

    for i , (chunks , embeddings) in enumerate(zip(chunks , embeddings )):
        cursor.execute("INSERT INTO chunks (id , text) VALUES (%s , %s) ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text"  , (f"{file_name}_{i}" , chunks))

        tuples = (f"{file_name}_{i}" , embeddings)
        list_of_embed_tuple.append(tuples)

    conn.commit()
    index.upsert(vectors=list_of_embed_tuple)

def search(user_ques):
    response = gemini_client.models.embed_content(
        model="gemini-embedding-001",
        contents=user_ques
    )

    que_embeddings = response.embeddings[0].values

    pinecone_res = index.query(vector=que_embeddings , top_k=5)

    relavant_chunks = []

    for ids in pinecone_res.matches:
        cursor.execute("SELECT * FROM chunks WHERE id = %s" , (ids.id , ))
        response = cursor.fetchone()

        relavant_chunks.append(response)

    return relavant_chunks

def get_answer(user_que , relavant_chunk):
    response = gemini_client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=f"Here is the user question {user_que} , and these are the relavant chunks {relavant_chunk} , answer the user que"

    )

    return response.text






