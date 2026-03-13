import type MapView from '@arcgis/core/views/MapView';

/**
 * Module-level registry for ArcGIS MapView instances, keyed by customFieldId.
 * Used by PDF and Word export to capture map screenshots.
 *
 * ArcGIS maps use WebGL which can't be captured by html2canvas,
 * so we pre-capture screenshots while maps are visible on screen
 * and store them here for later use during export.
 */
const mapViews = new Map<string, MapView>();
const mapScreenshots = new Map<string, string>();

export const registerMapView = (id: string, view: MapView) => {
  mapViews.set(id, view);
};

export const unregisterMapView = (id: string) => {
  mapViews.delete(id);
};

export const getMapScreenshot = (id: string): string | undefined => {
  return mapScreenshots.get(id);
};

/**
 * Captures screenshots from all registered MapView instances.
 * Call this before triggering PDF or Word export, while maps are
 * still visible on screen and have their tiles loaded.
 */
export async function captureAllMapScreenshots(): Promise<void> {
  mapScreenshots.clear();

  for (const [id, mapView] of mapViews.entries()) {
    if (!mapView.ready) continue;

    try {
      // Wait for the map to finish loading tiles if it's still updating
      if (mapView.updating) {
        await new Promise<void>((resolve) => {
          const timeout = setTimeout(resolve, 5000);
          const handle = mapView.watch('updating', (updating: boolean) => {
            if (!updating) {
              clearTimeout(timeout);
              handle.remove();
              resolve();
            }
          });
        });
      }

      const screenshot = await mapView.takeScreenshot({ format: 'png' });
      mapScreenshots.set(id, screenshot.dataUrl);
    } catch {
      // Skip this map if screenshot fails
    }
  }
}
