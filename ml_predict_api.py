import json
import sys
from pathlib import Path

import joblib
import pandas as pd


ROOT = Path(__file__).resolve().parent
MODEL_PATH = ROOT / "multi_output_model.joblib"
COLS_PATH = ROOT / "X_train_columns.joblib"
MEDIANS_PATH = ROOT / "X_train_medians.joblib"


def to_number(value, default=0.0):
  try:
    if value is None or value == "":
      return default
    return float(value)
  except (TypeError, ValueError):
    return default


def build_feature_row(payload):
  latest = payload.get("latest", {}) or {}
  activity = str(payload.get("activity") or latest.get("activity") or "Training")

  return {
    "TotalSteps": to_number(latest.get("total_steps"), 7000.0),
    "TotalDistance": to_number(latest.get("distance"), 5.5),
    "Calories": to_number(latest.get("calories"), 2200.0),
    "HeartRateAvg": to_number(latest.get("heart_rate"), 80.0),
    "SleepDurationHours": to_number(latest.get("sleep_hours"), 7.0),
    "acceleration_x": to_number(latest.get("acceleration_x"), 0.0),
    "acceleration_y": to_number(latest.get("acceleration_y"), 0.0),
    "acceleration_z": to_number(latest.get("acceleration_z"), 0.0),
    "acceleration_magnitude": to_number(latest.get("acceleration_magnitude"), 0.0),
    "acwr": to_number(payload.get("acwr"), 1.0),
    "avg_heart_rate": to_number(latest.get("heart_rate"), 80.0),
    "performance_drop_percentage": to_number(payload.get("performanceDrop"), 0.0),
    "recovery_score": to_number(latest.get("recovery_score"), 75.0),
    "resting_heart_rate": to_number(latest.get("resting_heart_rate"), 65.0),
    "sleep_duration_hours": to_number(latest.get("sleep_hours"), 7.0),
    "stress_level_score": to_number(latest.get("stress_level"), 30.0),
    "training_load": to_number(latest.get("training_load"), 350.0),
    "activity": activity,
  }


def prepare_input_dataframe(raw_data, x_train_columns, x_train_medians):
  input_df = pd.DataFrame([raw_data])
  prediction_df = pd.DataFrame(columns=x_train_columns, index=[0])

  for col in input_df.columns:
    if col in prediction_df.columns:
      prediction_df[col] = input_df[col]

  activity_dummies = pd.get_dummies(input_df["activity"], prefix="activity")
  for col in [c for c in x_train_columns if c.startswith("activity_")]:
    prediction_df[col] = bool(activity_dummies.get(col, pd.Series([False])).iloc[0])

  for col in x_train_columns:
    if col not in prediction_df.columns:
      prediction_df[col] = None

    if prediction_df[col].isnull().any():
      median_val = x_train_medians[col] if col in x_train_medians.index else 0
      prediction_df[col] = prediction_df[col].fillna(median_val)

  return prediction_df[x_train_columns]


def main():
  try:
    payload = json.load(sys.stdin)
    model = joblib.load(MODEL_PATH)
    x_train_columns = joblib.load(COLS_PATH)
    x_train_medians = joblib.load(MEDIANS_PATH)

    raw_data = build_feature_row(payload or {})
    prediction_df = prepare_input_dataframe(raw_data, x_train_columns, x_train_medians)
    predictions = model.predict(prediction_df)

    injury_risk = predictions[0][0]
    overtraining_risk = predictions[0][1]
    readiness_status = predictions[0][2]

    result = {
      "injuryRisk": injury_risk.item() if hasattr(injury_risk, "item") else injury_risk,
      "overtrainingRisk": overtraining_risk.item() if hasattr(overtraining_risk, "item") else overtraining_risk,
      "readinessStatus": readiness_status.item() if hasattr(readiness_status, "item") else readiness_status,
    }

    print(json.dumps(result))
  except Exception as exc:
    print(json.dumps({"error": str(exc)}))
    sys.exit(1)


if __name__ == "__main__":
  main()
