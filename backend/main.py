from fastapi import FastAPI
from pydantic import BaseModel
import joblib

app = FastAPI()
model = joblib.load('diabetes_model.pkl')

# Fixed encoding maps — must match training-time LabelEncoder order exactly
gender_map = {'Female': 0, 'Male': 1, 'Other': 2}
smoking_map = {'No Info': 0, 'current': 1, 'ever': 2, 'former': 3, 'never': 4, 'not current': 5}

class Patient(BaseModel):
    age: float
    hypertension: int
    heart_disease: int
    bmi: float
    HbA1c_level: float
    blood_glucose_level: int
    gender: str
    smoking_history: str

@app.post('/predict')
def predict(p: Patient):
    if p.gender not in gender_map:
        return {"error": f"Invalid gender '{p.gender}'. Expected one of {list(gender_map.keys())}"}
    if p.smoking_history not in smoking_map:
        return {"error": f"Invalid smoking_history '{p.smoking_history}'. Expected one of {list(smoking_map.keys())}"}

    gender_encoded = gender_map[p.gender]
    smoking_encoded = smoking_map[p.smoking_history]

    # plain list-of-lists, matching the .to_numpy() format used at training time
    X = [[p.age, p.hypertension, p.heart_disease, p.bmi,
          p.HbA1c_level, p.blood_glucose_level,
          gender_encoded, smoking_encoded]]

    prob = float(model.predict_proba(X)[0][1])
    prediction = int(model.predict(X)[0])

    return {
        "diabetes_prediction": prediction,
        "diabetes_probability": round(prob, 3)
    }
