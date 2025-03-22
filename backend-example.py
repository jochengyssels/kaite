from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:3000",  # React dev server
    "http://localhost:3001",  # Next.js dev server on alternate port
    "http://localhost:3002",  # Next.js dev server on another alternate port
    "http://192.168.129.17:3000",  # Network access on port 3000
    "http://192.168.129.17:3001",  # Network access on port 3001
    "http://192.168.129.17:3002",  # Network access on port 3002
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # List of allowed origins
    allow_credentials=True,  # Allow cookies
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Allowed methods
    allow_headers=["Content-Type", "Authorization", "Accept"],  # Allowed headers
)

# Routes
@app.post("/api/chat")
async def chat(message: dict):
    """
    Chat API endpoint
    
    Example request body:
    {
        "message": "Hello, what are the best kitesurfing spots?"
    }
    """
    try:
        # Process the message and generate a response
        # This is where your actual AI/chatbot logic would go
        user_message = message.get("message", "")
        
        # Example response
        reply = f"You asked about: {user_message}\nHere are some kitesurfing spots to consider:\n- Tarifa, Spain\n- Maui, Hawaii\n- Cape Town, South Africa"
        
        return {"reply": reply}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/forecast")
async def get_forecast(latitude: float, longitude: float):
    """
    Forecast API endpoint
    
    Example query params:
    ?latitude=36.0123&longitude=-5.6072
    """
    try:
        # Get forecast data based on coordinates
        # This is where you would call weather APIs or your forecast model
        
        # Example response
        forecast_data = {
            "ai_corrected_forecast": 18.5,
            "original_forecast": {
                "tomorrow_io": 16.2,
                "open_meteo": 17.8
            },
            "wind_direction": 145
        }
        
        return forecast_data
    except Exception as e:
        return {"error": str(e)}

# Run with: uvicorn backend-example:app --reload 