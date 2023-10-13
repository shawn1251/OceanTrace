# OceanTrace
OceanTrace is a small web application developed as a learning project during my exploration of Typescript, React and BigQuery. It serves as a template for creating a trajectory 3D viewer, leveraging React for the frontend, Python and FastAPI for the backend, BigQuery for the database, and Cesium for the immersive visualization of trajectories.


## Technology
* React
* TypeScript
* FastAPI
* Python3
* BigQuery
* Cesium
* Material-UI

## Features
* Big Data Storage: Stores parsed data in Google BigQuery for scalable and efficient data management.
* Cesium Visualization: Utilizes Cesium for a dynamic and interactive 3D map interface to display trajectories.
* High Scalability: The project is small and can be easily customized.


## Getting Started
To get started with OceanTrace, follow these steps:

### Prerequisites
* Python3
* pipenv
* yarn
* vite
* Google Cloud Platform Account

### Installation
Install backend dependencies:

```bash
cd frontend
yarn
```

Install frontend dependencies:

```bash
cd backend
pipenv install
```

Configuration
* Set up Google BigQuery credentials.
* `mv {your-key.json} {project-path}/config/bq-key.json`
* Copy the `{project-path}/config/backend-config-example.yml` and rename `backend-config.yml`. Edit to fit your setting in big query platform


## Development

### Parse and import data into BigQuery
the data is retrieve from https://globalfishingwatch.org/data-download/datasets/public-training-data-v1. I use `trawler.csv`, but you can choose the data you want to run.
```bash
cd backend
pipenv run parse {file_name}
```

### Run the backend server:

```
cd backend
pipenv run uvicorn main:app
```
the dev server will run on http://localhost:8000. You can check the openapi document on http://localhost:8000/docs



### Start the frontend application:

```
cd frontend
yarn dev
```
Open your browser and navigate to http://localhost:5173 to explore OceanTrace.


## Acknowledgments
* Global Fishing Watch for providing valuable open data.
* Cesium for the powerful 3D mapping capabilities.
* Resium for the easiser way to integrate with React and Cesium
* Oksana3D for the [Fishing Vessel 3D Model](https://rigmodels.com/model.php?view=Fishing_Vessel-3d-model__COQ6RH0SZFD4VOZ2LDIFWZSTP&searchkeyword=fishing%20boat&manualsearch=1)
