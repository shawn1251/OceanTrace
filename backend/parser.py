import os
from google.cloud import bigquery as bq
import pandas as pd
import sys
import yaml
from os import path

with open("../config/backend-config.yml") as f:
    config_data = yaml.safe_load(f)

PROJECT_NAME = config_data["PROJECT_NAME"]
DATASET = config_data["DATASET"]
TABLE = config_data["TABLE"]
CSV_FILE_PATH = sys.argv[1]
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "./config/bq-key.json"

schema = [
    bq.SchemaField("mmsi", "STRING", mode="REQUIRED"),
    bq.SchemaField("timestamp", "DATETIME", mode="REQUIRED"),
    bq.SchemaField("distance_from_shore", "FLOAT64", mode="REQUIRED"),
    bq.SchemaField("distance_from_port", "FLOAT64", mode="REQUIRED"),
    bq.SchemaField("speed", "FLOAT64", mode="REQUIRED"),
    bq.SchemaField("course", "FLOAT64", mode="REQUIRED"),
    bq.SchemaField("lat", "FLOAT64", mode="REQUIRED"),
    bq.SchemaField("lon", "FLOAT64", mode="REQUIRED"),
    bq.SchemaField("is_fishing", "FLOAT64", mode="REQUIRED"),
    bq.SchemaField("source", "STRING", mode="REQUIRED"),
]

dtypes = {
    "mmsi": float,
    "timestamp": float,
    "distance_from_shore": float,
    "distance_from_port": float,
    "speed": float,
    "course": float,
    "lat": float,
    "lon": float,
    "is_fishing": float,
    "source": str,
}
if __name__ == "__main__":
    CSV_FILE_PATH = sys.argv[1]
    if not path.exists(CSV_FILE_PATH):
        raise Exception(f"{CSV_FILE_PATH} not exists!")

    df = pd.read_csv(CSV_FILE_PATH, dtype=dtypes)
    # df["is_fishing"] = df["is_fishing"].apply(lambda x: x > 0.0)
    df["mmsi"] = df["mmsi"].apply(lambda x: str(int(x)))
    df["is_fishing"] = df["is_fishing"].apply(lambda x: int(x))
    df["timestamp"] = pd.to_datetime(df["timestamp"], unit="s")

    client = bq.Client()
    job_config = bq.LoadJobConfig(schema=schema)
    table = bq.Table(f"{PROJECT_NAME}.{DATASET}.{TABLE}", schema=schema)
    load_job = client.load_table_from_dataframe(df, table, job_config=job_config)
    load_job.result()
    print(f"Loaded {load_job.output_rows} rows into {DATASET}.{TABLE}")
