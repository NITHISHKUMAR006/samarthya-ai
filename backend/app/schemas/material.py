from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class MaterialResponse(BaseModel):
    id: int
    filename: str
    original_name: str
    file_type: str
    file_size: int
    status: str
    extracted_text_preview: str = ""
    uploaded_at: datetime

    model_config = {"from_attributes": True}
