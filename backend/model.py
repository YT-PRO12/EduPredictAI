from pathlib import Path

import joblib
import pandas as pd


# Project root
BASE_DIR = Path(__file__).resolve().parent.parent

# Saved model path
MODEL_PATH = BASE_DIR / "models" / "final_model.pkl"

# Load model
model = joblib.load(MODEL_PATH)


def predict_dropout(student_data: dict) -> float:
    """
    Return the model's predicted probability of Dropout.
    """

    student_df = pd.DataFrame([student_data])

    probability = model.predict_proba(student_df)[0, 1]

    return float(probability)


def get_risk_level(probability: float) -> str:
    """
    Convert dropout probability into a prototype risk category.
    """

    if probability < 0.30:
        return "LOW"

    elif probability < 0.60:
        return "MEDIUM"

    else:
        return "HIGH"


def generate_intervention_plan(
    probability: float,
    student_data: dict
) -> dict:
    """
    Generate a rule-based intervention plan.
    """

    risk_level = get_risk_level(probability)

    interventions = []

    # Academic support
    if student_data["Admission grade"] < 120:
        interventions.append(
            "Academic mentoring"
        )

    # Financial support
    if student_data["Debtor"] == 1:
        interventions.append(
            "Financial-support review"
        )

    # Tuition issue
    if student_data["Tuition fees up to date"] == 0:
        interventions.append(
            "Tuition-support review"
        )

    # Scholarship support
    if student_data["Scholarship holder"] == 0:
        interventions.append(
            "Review scholarship or financial-aid eligibility"
        )

    # Default intervention
    if len(interventions) == 0:
        interventions.append(
            "Routine academic monitoring"
        )

    # Monitoring frequency
    if risk_level == "HIGH":
        monitoring = "Weekly"

    elif risk_level == "MEDIUM":
        monitoring = "Every 2 weeks"

    else:
        monitoring = "Monthly"

    return {
        "risk_level": risk_level,
        "interventions": interventions,
        "monitoring": monitoring
    }