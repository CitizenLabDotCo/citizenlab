import { useCallback, useEffect } from 'react';

import { registerMapView, unregisterMapView } from 'utils/mapViewRegistry';

import type MapView from '@arcgis/core/views/MapView';

// An ArcGIS map draws on a WebGL canvas, and the PDF path lays the report out by
// copying its DOM — a copied canvas comes out blank. So the PDF shows a screenshot
// taken from the live MapView instead, and registering here is what makes the view
// reachable when those screenshots are taken.
const useRegisterMapView = (customFieldId: string) => {
  useEffect(() => () => unregisterMapView(customFieldId), [customFieldId]);

  return useCallback(
    (view: MapView) => registerMapView(customFieldId, view),
    [customFieldId]
  );
};

export default useRegisterMapView;
