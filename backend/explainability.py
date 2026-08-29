from pathlib import Path

import joblib
import pandas as pd
import shap


# ============================================================
# PROJECT PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "models" / "final_model.pkl"

BACKGROUND_PATH = BASE_DIR / "models" / "shap_background.pkl"


# ============================================================
# LOAD FINAL MODEL
# ============================================================

model = joblib.load(MODEL_PATH)


# ============================================================
# LOAD SHAP BACKGROUND
# ============================================================

background_data = joblib.load(BACKGROUND_PATH)


# ============================================================
# CREATE SHAP EXPLAINER ONCE
# ============================================================

explainer = shap.LinearExplainer(
    model.named_steps["model"],
    background_data
)


# ============================================================
# EXPLAIN ONE STUDENT
# ============================================================

def explain_student(
    model_pipeline,
    student_data: dict
):
    """
    Explain a student's dropout prediction using SHAP.
    """

    # Get preprocessing component
    preprocessor = model_pipeline.named_steps[
        "preprocessor"
    ]

    # Convert dictionary to DataFrame
    student_df = pd.DataFrame([
        student_data
    ])

    # Apply the same preprocessing used during training
    transformed_student = preprocessor.transform(
        student_df
    )

    # Convert sparse matrix to dense array
    if hasattr(
        transformed_student,
        "toarray"
    ):
        transformed_student = (
            transformed_student.toarray()
        )

    # Get transformed feature names
    feature_names = (
        preprocessor
        .get_feature_names_out()
    )

    # Calculate SHAP
    shap_result = explainer(
        transformed_student
    )

    # Get contributions for this student
    values = shap_result.values[0]

    # Create explanation table
    explanation_df = pd.DataFrame({
        "feature": feature_names,
        "shap_value": values
    })

    # Absolute value for ranking
    explanation_df[
        "absolute_value"
    ] = explanation_df[
        "shap_value"
    ].abs()

    # Strongest contributors first
    explanation_df = (
        explanation_df
        .sort_values(
            by="absolute_value",
            ascending=False
        )
    )

    # Remove technical prefixes
    explanation_df[
        "feature"
    ] = (
        explanation_df["feature"]
        .str.replace(
            "num__",
            "",
            regex=False
        )
        .str.replace(
            "cat__",
            "",
            regex=False
        )
    )

    # Keep strongest 8 contributors
    top_features = explanation_df.head(8)

    results = []

    for _, row in top_features.iterrows():

        shap_value = float(
            row["shap_value"]
        )

        results.append({
            "feature": row["feature"],
            "contribution": round(
                shap_value,
                4
            ),
            "direction": (
                "increases_risk"
                if shap_value > 0
                else "decreases_risk"
            )
        })

    return results