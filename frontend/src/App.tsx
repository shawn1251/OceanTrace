import { useState, useEffect } from 'react';
import { Viewer as CesiumViewer, Cartesian3, Color, HeightReference, JulianDate, SampledPositionProperty, ShadowMode } from 'cesium'
import { Viewer, Entity, PolylineGraphics, ModelGraphics, PathGraphics } from 'resium'
import './App.css';
import Panel from './Panel';
import { Dayjs } from 'dayjs';
import DataFetcher from './DataFetcher';
import { PathData, PolylineData, PointData } from './DataFetcher';
import CesiumController from './ViewerController';

function App() {
  const apiUrl = "http://127.0.0.1:8000"
  const dataFetcher = new DataFetcher(apiUrl);
  let viewer: CesiumViewer | undefined | null = null;
  const cesiumController = new CesiumController(null)


  const [mmsiList, setMmsiList] = useState<string[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const tmpList = await dataFetcher.fetchVesselList()
        setMmsiList(tmpList);
      } catch (error) {
        window.alert(`Error fetching data: ${error}`);
      }
    };

    fetchData();
  },[]);

  const [pathEntities, setPathEntities] = useState<PathData>();
  const [polylineEntities, setPolylineEntities] = useState<PolylineData>();
  const [pointsEntity, setPointsEntities] = useState<PointData[]>([]);

  const handleFetchTrajectoryData = async (selectedMmsi: string, selectedStartTime: Dayjs | null, selectedEndTime: Dayjs | null) => {
    try {
      const rawVesselPoints = await dataFetcher.fetchVesselPoints(selectedMmsi, selectedStartTime, selectedEndTime)
      const positions = []
      const pointsData = []
      const property = new SampledPositionProperty();
      for (const [ind, doc] of rawVesselPoints.entries()) {
        positions.push(doc.lon)
        positions.push(doc.lat)
        const moveEntityPositions = Cartesian3.fromDegrees(doc.lon, doc.lat, 100) // Position the boat model above the surface of the sea
        property.addSample(JulianDate.fromIso8601(doc.timestamp), moveEntityPositions)
        const pointData = dataFetcher.processVesselData(ind, doc);
        pointsData.push(pointData)
      }
      const polylineData = dataFetcher.createPolylineData(Cartesian3.fromDegreesArray(positions));
      const pathData = dataFetcher.createPathData(property);

      setPointsEntities(pointsData)
      setPathEntities(pathData)
      setPolylineEntities(polylineData)

      if (viewer) {
        cesiumController.setViewer(viewer)
        cesiumController.zoomToTimeRange(rawVesselPoints[0].timestamp, rawVesselPoints[rawVesselPoints.length - 1].timestamp)
        cesiumController.zoomToCamera(rawVesselPoints[0].lon, rawVesselPoints[0].lat)
        cesiumController.setDirectionLight()
      }
      
    } catch (error) {
      window.alert(`Error fetching data: ${error}`);
    }
  }

  return (
      <div>
        <Panel onFetchTrajectoryData={handleFetchTrajectoryData} mmsiList={mmsiList} />

        <Viewer full ref={e => {
          viewer = e && e.cesiumElement;
        }}>
          {pointsEntity.map((pointsData, index) => (
            <Entity key={index} {...pointsData} >
            </Entity>
          ))}
          <Entity {...polylineEntities} >
            <PolylineGraphics {...polylineEntities?.childComponent} />
          </Entity>

          <Entity {...pathEntities} >
            <ModelGraphics
              uri="/ship.glb"
              minimumPixelSize={128}
              maximumScale={10000}
              color={Color.WHITE}
              colorBlendAmount={1.0}
              shadows={ShadowMode.DISABLED}
              heightReference={HeightReference.RELATIVE_TO_GROUND}
              silhouetteColor={Color.WHITE}
              silhouetteSize={1.0}
            />
            <PathGraphics />
          </Entity>


        </Viewer>
      </div>
  )
}

export default App