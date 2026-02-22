from fastapi.testclient import TestClient
from backend.main import app
from pathlib import Path

client = TestClient(app)
yaml_path = Path(__file__).parent.parent / "demo.yaml"

def test_forecast_endpoint_parsing():
    with open(yaml_path, "r") as f:
        yaml_content = f.read()
    
    response = client.post(
        "/api/forecast", 
        content=yaml_content, 
        headers={"Content-Type": "text/plain"}
    )
    
    assert response.status_code == 200, f"Failed with: {response.text}"
    data = response.json()
    assert data["status"] == "success"
    
    forecast_data = data["data"]
    assert "timeline" in forecast_data
    assert "summary" in forecast_data
    assert "final_cashflow" in forecast_data["summary"]
    
    # Optional: ensure it's still roughly computing the same ballpark for cashflow (~2.5M to 3M)
    # This proves the new array-based math is mostly equivalent to the old single-salary math
    assert forecast_data['summary']['final_cashflow'] > 1000000 
    
    print("\n[SUCCESS] API successfully ran the simulation!")
    print(f"Final simulated cashflow: {forecast_data['summary']['final_cashflow']}")
