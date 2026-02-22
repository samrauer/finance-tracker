from fastapi import FastAPI, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yaml
from pydantic import ValidationError
from .schemas import FinanceData
from .forecast import run_simulation

app = FastAPI(title="Finance Tracker API")

# Only for local dev
# TODO: Remove this later
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/forecast")
async def create_forecast(yaml_content: str = Body(..., media_type="text/plain", description="The YAML configuration text")):
    """
    Receives the plain text YAML file describing income, expenses, and investments.
    Parses and validates it using Pydantic, then runs the future net worth forecast.
    """
    # 1. Parse YAML
    try:
        data_dict = yaml.safe_load(yaml_content)
    except yaml.YAMLError as e:
        raise HTTPException(status_code=400, detail=f"Invalid YAML structure: {e}")
        
    if not isinstance(data_dict, dict):
        raise HTTPException(status_code=400, detail="YAML must be a dictionary at the top level.")

    # 2. Validate with Pydantic schemas
    try:
        finance_data = FinanceData(**data_dict)
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.errors())
        
    # 3. Pass the validated `finance_data` to our Polars simulation engine
    forecast_results = run_simulation(finance_data)
    
    return {
        "status": "success",
        "message": "Forecast generated successfully",
        "data": forecast_results
    }
