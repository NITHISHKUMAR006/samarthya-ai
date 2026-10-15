from pydantic import BaseModel


class CompetencyResponse(BaseModel):
    id: int
    name: str
    category: str
    description: str

    model_config = {"from_attributes": True}


class CompetencyGapResponse(BaseModel):
    competency_id: int
    competency_name: str
    category: str
    current_score: float
    required_score: float
    gap: float
    priority: str  # High | Medium | Low
