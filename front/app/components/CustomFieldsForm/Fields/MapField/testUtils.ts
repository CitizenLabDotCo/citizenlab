import Collection from '@arcgis/core/core/Collection';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import MapView from '@arcgis/core/views/MapView';

import { newNumberedPinGraphics } from 'components/EsriMap/utils';

// The helpers under test reach for the view's own graphics and for its layers,
// and nothing else on it. A real MapView needs a browser to draw into, so a
// stand-in carrying those two is both enough and all that can be built here.
export const fakeMapViewWith = (layer: GraphicsLayer) =>
  ({
    graphics: new Collection<Graphic>(),
    map: { layers: new Collection([layer]) },
  } as unknown as MapView);

export const userInputLayerWith = (graphics: Graphic[]) => {
  const layer = new GraphicsLayer({ title: 'User Input' });
  layer.addMany(graphics);

  return layer;
};

export const userInputLayerWithPins = (coordinates: number[][]) =>
  userInputLayerWith(
    coordinates.map(
      (coordinates, index) =>
        newNumberedPinGraphics(
          { type: 'Point', coordinates },
          '#123456',
          index + 1
        ).pin
    )
  );
