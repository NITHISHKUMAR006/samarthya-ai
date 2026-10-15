"""
RAG (Retrieval-Augmented Generation) Service

Future flow:
  PDF/PPT → text extraction → chunking → embeddings → vector store
  Query → retrieve relevant chunks → LLM prompt → answer/quiz

For the MVP, this provides a mock interface that can later be replaced
by a real vector store + LLM pipeline.
"""


class RAGService:
    """Interface for Retrieval-Augmented Generation."""

    def __init__(self, llm_api_key: str = ""):
        self.llm_api_key = llm_api_key
        self.is_mock = not bool(llm_api_key)

    def chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
        """Split text into overlapping chunks for embedding."""
        if not text:
            return []
        chunks = []
        start = 0
        while start < len(text):
            end = min(start + chunk_size, len(text))
            chunks.append(text[start:end])
            start += chunk_size - overlap
        return chunks

    def generate_embeddings(self, chunks: list[str]) -> list[list[float]]:
        """Generate embeddings for text chunks.
        MVP: returns mock zero-vectors. Replace with real embedding model later.
        """
        return [[0.0] * 128 for _ in chunks]

    def retrieve(self, query: str, chunks: list[str], top_k: int = 3) -> list[str]:
        """Retrieve most relevant chunks for a query.
        MVP: returns the first top_k chunks. Replace with real similarity search later.
        """
        return chunks[:top_k]

    def generate_answer(self, query: str, context: str) -> str:
        """Generate an answer using the LLM with retrieved context."""
        try:
            from app.ai.openai_service import openai_service
            if openai_service.is_available:
                sys_prompt = f"You are a MoSPI capacity building AI advisor. Use the following context to answer the question:\n{context[:2000]}"
                res = openai_service.chat(user_message=query, system_prompt=sys_prompt)
                return res.get("reply", "")
        except Exception:
            pass
        return f"[RAG Knowledge Base] Based on official reference documents for '{query[:60]}', key frameworks mandate compliance with national capacity standards."
