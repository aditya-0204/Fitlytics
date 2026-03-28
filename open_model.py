import joblib
model = joblib.load("multi_output_model.joblib")
print("Model loaded successfully!")
print("Number of features:", model.n_features_in_)
print("Feature names:", model.feature_names_in_)
print("Model type:", type(model))
