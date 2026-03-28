import pandas as pd
import numpy as np
import joblib
multi_output_model = joblib.load('multi_output_model.joblib')
X_train_columns = joblib.load('X_train_columns.joblib')
x_train_medians = joblib.load('X_train_medians.joblib')
new_player_raw_data = {
    'TotalSteps': [7000.0],
    'TotalDistance': [5.5],
    'Calories': [2200.0],
    'HeartRateAvg': [85.0],
    'SleepDurationHours': [5.5],
    'acceleration_x': [1.2],
    'acceleration_y': [0.5],
    'acceleration_z': [-0.8],
    'acceleration_magnitude': [1.53],
    'acwr': [0.7],
    'avg_heart_rate': [80.0],
    'performance_drop_percentage': [7.0],
    'recovery_score': [90.0],
    'resting_heart_rate': [40.0],
    'sleep_duration_hours': [8.0],
    'stress_level_score': [1.0],
    'training_load': [20.0],
    'activity': ['Walking'] 
}
new_player_df = pd.DataFrame(new_player_raw_data)
prediction_df = pd.DataFrame(columns=X_train_columns)
for col in new_player_df.columns:
    if col in prediction_df.columns:
        prediction_df[col] = new_player_df[col]

activity_dummies = pd.get_dummies(new_player_df['activity'], prefix='activity')

for col in [c for c in X_train_columns if c.startswith('activity_')]:
    prediction_df[col] = activity_dummies.get(col, False)
for col in X_train_columns:
    if col not in prediction_df.columns or prediction_df[col].isnull().any():
        if col in x_train_medians.index and pd.api.types.is_numeric_dtype(prediction_df[col]):
            median_val = x_train_medians[col]
            prediction_df[col] = prediction_df[col].fillna(median_val)
        elif prediction_df[col].dtype == 'object':
            prediction_df[col] = prediction_df[col].fillna('Unknown')
prediction_df = prediction_df[X_train_columns]

if len(prediction_df) > 1:
    prediction_df = prediction_df.iloc[:1]
print("\n--- Prepared New Player Data for Prediction ---")
print(prediction_df)

new_player_predictions = multi_output_model.predict(prediction_df)

predicted_injury_risk = new_player_predictions[0][0]
predicted_overtraining_risk = new_player_predictions[0][1]
predicted_readiness_status = new_player_predictions[0][2]

print("\n--- Predictions for New Player ---")
print(f"Predicted Injury Risk: {predicted_injury_risk}")
print(f"Predicted Overtraining Risk: {predicted_overtraining_risk}")
print(f"Predicted Readiness Status: {predicted_readiness_status}")