import datetime
from fastapi import FastAPI, Query, Path, responses
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from google.cloud import bigquery
import os
from typing import List, Dict
from model import VesselPosition
from dateutil.parser import parse as dt_parse
import yaml


with open("../config/backend-config.yml") as f:
    config_data = yaml.safe_load(f)

PROJECT_NAME = config_data["PROJECT_NAME"]
DATASET = config_data["DATASET"]
TABLE = config_data["TABLE"]

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "../config/bq-key.json"


app = FastAPI(default_response_class=responses.ORJSONResponse)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config_data.get("CORS_ALLOW_ORIGIN"),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_mmsi_distinct_list() -> List[str]:
    """
    Retrieves a list of distinct MMSI values from a BigQuery table.

    Returns:
        A list of distinct MMSI values from the specified BigQuery table.

    Example Usage:
        mmsi_list = get_mmsi_distinct_list()
        print(mmsi_list)
        # Output: ['123456789', '987654321', '456789123']
    """
    client = bigquery.Client()
    query = f"""
        SELECT DISTINCT mmsi from `{PROJECT_NAME}.{DATASET}.{TABLE}`
    """
    query_job = client.query(query)
    # Wait for the query to complete
    rows = query_job.result()

    return [i["mmsi"] for i in rows]


def get_vessel_points_by_time_range(
    mmsi: str = Path(
        ..., title="MMSI", description="vessel MMSI", example="1252339803566"
    ),
    start_time: Optional[str] = Query(
        None,
        title="Start Time",
        description="Start timestamp",
        example="2012-01-31T07:11:59",
    ),
    end_time: Optional[str] = Query(
        None,
        title="End Time",
        description="End timestamp",
        example="2012-02-03T11:48:31",
    ),
) -> List[VesselPosition]:
    """
    Retrieves vessel position data from a BigQuery table based on a specified time range.

    Args:
        mmsi (str): The MMSI (Maritime Mobile Service Identity) of the vessel.
        start_time (str, optional): The start timestamp of the time range to retrieve data from.
        end_time (str, optional): The end timestamp of the time range to retrieve data from.

    Returns:
        List[VesselPosition]: A list of `VesselPosition` objects containing the retrieved vessel position data.
    """

    # Initialize BigQuery client
    client = bigquery.Client()
    start_time = dt_parse(start_time)
    end_time = dt_parse(end_time)
    # Construct the SQL query to retrieve the data
    query = f"""
        SELECT mmsi, timestamp, lat, lon, speed, course
        FROM `{PROJECT_NAME}.{DATASET}.{TABLE}`
        WHERE mmsi = @mmsi
        {'AND timestamp BETWEEN DATETIME(@start_time) AND DATETIME(@end_time)' if start_time and end_time else ''}
        ORDER BY timestamp ASC
        """
    query_parameters = [bigquery.ScalarQueryParameter("mmsi", "STRING", mmsi)]

    if start_time and end_time:
        query_parameters.append(
            bigquery.ScalarQueryParameter("start_time", "DATETIME", start_time)
        )
        query_parameters.append(
            bigquery.ScalarQueryParameter("end_time", "DATETIME", end_time)
        )
    # Run the query
    query_job = client.query(
        query, job_config=bigquery.QueryJobConfig(query_parameters=query_parameters)
    )

    # Wait for the query to complete
    rows = query_job.result()

    return [dict(row) for row in rows]


app.get("/vesselPoints/{mmsi}")(get_vessel_points_by_time_range)
app.get("/vesselList")(get_mmsi_distinct_list)
