import { Viewer as CesiumViewer, Cartesian3, ClockRange, JulianDate, ClockStep, DirectionalLight, Color } from "cesium";

class CesiumController {
  private viewer: CesiumViewer | null;
  /**
   * Controller for the Cesium library, used for creating and manipulating 3D maps and visualizations.
   * @param viewer - The Cesium viewer instance.
   */
  constructor(viewer: CesiumViewer | null) {
    this.viewer = viewer;
  }

  /**
   * Sets the viewer instance.
   * @param viewer - The Cesium viewer instance.
   */
  setViewer(viewer: CesiumViewer) {
    this.viewer = viewer;
  }

  /**
   * Sets the directional light of the scene based on the camera direction.
   */
  setDirectionLight() {
    if (this.viewer) {
      this.viewer.scene.light = new DirectionalLight({
        color: Color.WHITE,
        direction: this.viewer.scene.camera.directionWC,
      });
    }
  }

  /**
   * Zooms the timeline to the specified time range and sets the clock properties.
   * @param startTime - The start time of the time range in ISO 8601 format.
   * @param endTime - The end time of the time range in ISO 8601 format.
   */
  zoomToTimeRange(startTime: string, endTime: string) {
    const startJulianDate = JulianDate.fromIso8601(startTime);
    const endJulianDate = JulianDate.fromIso8601(endTime);

    this.viewer?.timeline.zoomTo(startJulianDate, endJulianDate);

    const clock = this.viewer?.clock;
    if (clock) {
      clock.startTime = startJulianDate;
      clock.stopTime = endJulianDate;
      clock.currentTime = startJulianDate;
      clock.multiplier = 25000;
      clock.clockRange = ClockRange.LOOP_STOP;
      clock.clockStep = ClockStep.SYSTEM_CLOCK_MULTIPLIER;
    }
  }

  /**
   * Flies the camera to the specified longitude and latitude position.
   * @param lon - The longitude of the camera position.
   * @param lat - The latitude of the camera position.
   */
  zoomToCamera(lon: number, lat: number) {
    const camera = this.viewer?.camera;
    if (camera) {
      camera.flyTo({
        destination: Cartesian3.fromDegrees(lon, lat, 250000.0),
      });
    }
  }
}

export default CesiumController;