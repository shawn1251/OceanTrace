import axios from 'axios';
import { Dayjs } from 'dayjs';
import { Cartesian3, Color, PolylineGlowMaterialProperty, SampledPositionProperty, VelocityOrientationProperty } from 'cesium';

export interface VesselData {
  lon: number;
  lat: number;
  timestamp: string;
  speed: number;
  course: number;
}

export interface PolylineGeographicData {
  clampToGround: boolean;
  positions: Array<Cartesian3>;
  width: number;
  material: PolylineGlowMaterialProperty;
}

export interface PolylineData {
  name: string;
  description: string;
  childComponent: PolylineGeographicData;
}

export interface PathData {
  name: string;
  description: string;
  position: SampledPositionProperty;
  orientation: VelocityOrientationProperty; // Replace with the actual type of VelocityOrientationProperty
}

export interface PointData {
  name: string
  position: Cartesian3;
  point: { pixelSize: number; color: Color };
  description: string;
}

class DataFetcher {
  /**
   * Initializes a new instance of the DataFetcher class.
   * @param apiUrl The URL of the API endpoint used for fetching vessel data.
   */
  constructor(private apiUrl: string) {}

  /**
   * Fetches a list of vessels from the API endpoint.
   * @returns A promise that resolves to an array of strings representing the vessel list.
   * @throws An error if there is an issue fetching the vessel list.
   */
  async fetchVesselList(): Promise<string[]> {
    try {
      const response = await axios.get<string[]>(`${this.apiUrl}/vesselList`);
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching vessel list: ${error}`);
    }
  }

  /**
   * Fetches vessel points for a specific vessel within a time range from the API endpoint.
   * @param mmsi The MMSI of the vessel.
   * @param startTime The start time of the time range. Can be null to fetch all points from the beginning.
   * @param endTime The end time of the time range. Can be null to fetch all points up to the current time.
   * @returns A promise that resolves to an array of VesselData objects representing the vessel points.
   * @throws An error if there is an issue fetching the vessel points or if no data is available.
   */
  async fetchVesselPoints(mmsi: string, startTime: Dayjs | null, endTime: Dayjs | null): Promise<VesselData[]> {
    try {
      let params = {};
      if (startTime && endTime) {
        params = {
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
        };
      }
      const response = await axios.get<VesselData[]>(`${this.apiUrl}/vesselPoints/${mmsi}`, {
        params: params,
      });

      if (!response.data || response.data.length < 2) {
        throw new Error('No Data');
      }

      return response.data;
    } catch (error) {
      throw new Error(`Error fetching vessel points: ${error}`);
    }
  }

  /**
   * Processes the raw vessel data and returns it as a PointData object.
   * @param ind The index of the data point.
   * @param data The raw vessel data.
   * @returns A PointData object representing the processed vessel data.
   */
  processVesselData(ind: number, data: VesselData): PointData {
    // Process the raw data and return PointData
    return {
      name: `point ${ind + 1}`,
      position: Cartesian3.fromDegrees(data.lon, data.lat, 0),
      point: { pixelSize: 6, color: Color.WHITE.withAlpha(0.6) },
      description: `<table class="cesium-infoBox-defaultTable cesium-infoBox-defaultTable-lighter"><tbody>` +
        `<tr><th>Time</th><td>${data.timestamp}</td></tr>` +
        `<tr><th>Longitude</th><td>${data.lon.toFixed(5)}</td></tr>` +
        `<tr><th>Latitude</th><td>${data.lat.toFixed(5)}</td></tr>` +
        `<tr><th>Speed</th><td>${data.speed.toFixed(2)}</td></tr>` +
        `<tr><th>Course</th><td>${data.course.toFixed(2)}</td></tr>` +
        `</tbody></table>`,
    };
  }

  /**
   * Creates a PolylineData object for visualizing a polyline on a map.
   * @param positions The positions of the polyline.
   * @returns A PolylineData object representing the polyline.
   */
  createPolylineData(positions: Cartesian3[]): PolylineData {
    return {
      name: "polyline",
      description: "PolylineGraphics",
      childComponent: {
        clampToGround: true,
        positions: positions,
        width: 15,
        material: new PolylineGlowMaterialProperty({
          glowPower: 0.1,
          color: Color.DARKRED,
        }),
      }
    };
  }

  /**
   * Creates a PathData object for visualizing a path on a map.
   * @param position The position property representing the path.
   * @returns A PathData object representing the path.
   */
  createPathData(position: SampledPositionProperty): PathData {
    // Replace the following line with the actual creation of VelocityOrientationProperty
    return {
      name: "path",
      description: "PathGraphics",
      position: position,
      orientation: new VelocityOrientationProperty(position),
    };
  }
}

export default DataFetcher;