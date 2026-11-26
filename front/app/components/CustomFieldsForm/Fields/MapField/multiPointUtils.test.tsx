import {
  convertCoordinatesToGeoJSON,
  convertGeojsonToWKT,
  convertWKTToGeojson,
  exceedsPinLimit,
  handleMapClickMultipoint,
  isLineOrPolygonInput,
  isAnswerFull,
  isMultiPointInput,
  removePinAt,
} from './multiPointUtils';
import { fakeMapViewWith, userInputLayerWithPins } from './testUtils';

// The real one runs the Esri projection engine, which needs a browser.
jest.mock('utils/mapUtils/map', () => ({
  projectPointToWebMercator: (geometry: {
    longitude: number;
    latitude: number;
  }) => geometry,
}));

describe('convertGeojsonToWKT', () => {
  it('correctly converts a GeoJSON Point to WKT', async () => {
    const pointGeoJSON = {
      pointGeoJSON: {
        type: 'Point',
        coordinates: [1, 2],
      },
    };
    const pointWKT = { pointGeoJSON: 'POINT (1 2)' };
    expect(convertGeojsonToWKT(pointGeoJSON)).toEqual(pointWKT);
  });
  it('correctly converts a GeoJSON LineString to WKT', async () => {
    const lineGeoJSON = {
      lineGeoJSON: {
        type: 'LineString',
        coordinates: [
          [1, 2],
          [3, 4],
        ],
      },
    };
    const lineWKT = { lineGeoJSON: 'LINESTRING (1 2, 3 4)' };
    expect(convertGeojsonToWKT(lineGeoJSON)).toEqual(lineWKT);
  });
  it('correctly converts a GeoJSON Polygon to WKT', async () => {
    const polygonGeoJSON = {
      polygonGeoJSON: {
        type: 'Polygon',
        coordinates: [
          [
            [1, 2],
            [3, 4],
            [5, 6],
            [1, 2],
          ],
        ],
      },
    };
    const polygonWKT = { polygonGeoJSON: 'POLYGON ((1 2, 3 4, 5 6, 1 2))' };
    expect(convertGeojsonToWKT(polygonGeoJSON)).toEqual(polygonWKT);
  });
  it('correctly converts a GeoJSON MultiPoint to WKT', async () => {
    const multipointGeoJSON = {
      multipointGeoJSON: {
        type: 'MultiPoint',
        coordinates: [
          [1, 2],
          [3, 4],
          [5, 6],
        ],
      },
    };
    const multipointWKT = {
      multipointGeoJSON: 'MULTIPOINT (1 2, 3 4, 5 6)',
    };
    expect(convertGeojsonToWKT(multipointGeoJSON)).toEqual(multipointWKT);
  });
  it('correctly converts a single-pin GeoJSON MultiPoint to WKT', async () => {
    const multipointGeoJSON = {
      multipointGeoJSON: { type: 'MultiPoint', coordinates: [[1, 2]] },
    };
    expect(convertGeojsonToWKT(multipointGeoJSON)).toEqual({
      multipointGeoJSON: 'MULTIPOINT (1 2)',
    });
  });
});

describe('convertWKTToGeojson', () => {
  it('correctly converts WKT to GeoJSON Point', async () => {
    const pointWKT = { pointWKT: 'POINT (1 2)' };
    const pointGeoJSON = {
      pointWKT: {
        type: 'Point',
        coordinates: [1, 2],
      },
    };
    expect(convertWKTToGeojson(pointWKT)).toEqual(pointGeoJSON);
  });
  it('correctly converts WKT to GeoJSON LineString', async () => {
    const lineWKT = { lineWKT: 'LINESTRING (1 2, 3 4)' };
    const lineGeoJSON = {
      lineWKT: {
        type: 'LineString',
        coordinates: [
          [1, 2],
          [3, 4],
        ],
      },
    };
    expect(convertWKTToGeojson(lineWKT)).toEqual(lineGeoJSON);
  });
  it('correctly converts WKT to GeoJSON Polygon', async () => {
    const polygonWKT = { polygonWKT: 'POLYGON ((1 2, 3 4, 5 6, 1 2))' };
    const polygonGeoJSON = {
      polygonWKT: {
        type: 'Polygon',
        coordinates: [
          [
            [1, 2],
            [3, 4],
            [5, 6],
            [1, 2],
          ],
        ],
      },
    };
    expect(convertWKTToGeojson(polygonWKT)).toEqual(polygonGeoJSON);
  });
  it('correctly converts WKT to GeoJSON MultiPoint', async () => {
    const multipointWKT = { multipointWKT: 'MULTIPOINT (1 2, 3 4, 5 6)' };
    const multipointGeoJSON = {
      multipointWKT: {
        type: 'MultiPoint',
        coordinates: [
          [1, 2],
          [3, 4],
          [5, 6],
        ],
      },
    };
    expect(convertWKTToGeojson(multipointWKT)).toEqual(multipointGeoJSON);
  });
  it('round-trips a MultiPoint through WKT and back', async () => {
    const geojson = {
      pins: {
        type: 'MultiPoint',
        coordinates: [
          [4.35, 50.85],
          [4.36, 50.86],
        ],
      },
    };
    expect(convertWKTToGeojson(convertGeojsonToWKT(geojson))).toEqual(geojson);
  });
});

describe('convertCoordinatesToGeoJSON', () => {
  const coordinates = () => [
    [1, 2],
    [3, 4],
    [5, 6],
  ];

  it('returns a MultiPoint without joining the pins', () => {
    expect(convertCoordinatesToGeoJSON(coordinates(), 'multipoint')).toEqual({
      type: 'MultiPoint',
      coordinates: coordinates(),
    });
  });

  it('returns a LineString for a line', () => {
    expect(convertCoordinatesToGeoJSON(coordinates(), 'line')).toEqual({
      type: 'LineString',
      coordinates: coordinates(),
    });
  });

  it('closes the ring for a polygon but not for a multipoint', () => {
    const polygon = convertCoordinatesToGeoJSON(coordinates(), 'polygon');
    expect(polygon.coordinates[0]).toHaveLength(4);

    const multipoint = convertCoordinatesToGeoJSON(coordinates(), 'multipoint');
    expect(multipoint.coordinates).toHaveLength(3);
  });
});

describe('input type predicates', () => {
  it('treats multipoint as a multi-point input', () => {
    expect(isMultiPointInput('multipoint')).toBe(true);
    expect(isMultiPointInput('line')).toBe(true);
    expect(isMultiPointInput('polygon')).toBe(true);
    expect(isMultiPointInput('point')).toBe(false);
  });

  it('does not treat multipoint as a shape, so no line connects its pins', () => {
    expect(isLineOrPolygonInput('multipoint')).toBe(false);
    expect(isLineOrPolygonInput('line')).toBe(true);
    expect(isLineOrPolygonInput('polygon')).toBe(true);
  });
});

describe('exceedsPinLimit', () => {
  it('allows pins up to the limit', () => {
    expect(exceedsPinLimit(3, 3)).toBe(false);
  });
  it('blocks the pin that would pass the limit', () => {
    expect(exceedsPinLimit(4, 3)).toBe(true);
  });
  it('allows any number of pins when there is no limit', () => {
    expect(exceedsPinLimit(12, undefined)).toBe(false);
    expect(exceedsPinLimit(12, 0)).toBe(false);
  });
});

describe('isAnswerFull', () => {
  it('is full once the pins reach the limit', () => {
    expect(isAnswerFull(3, 3)).toBe(true);
    expect(isAnswerFull(2, 3)).toBe(false);
  });

  it('is never full without a limit', () => {
    expect(isAnswerFull(12, undefined)).toBe(false);
    expect(isAnswerFull(12, 0)).toBe(false);
  });

  it('is never full at a single location, where a click moves the pin', () => {
    expect(isAnswerFull(1, 1)).toBe(false);
  });
});

describe('removePinAt', () => {
  const THREE_PINS = [
    [4.35, 50.85],
    [4.36, 50.86],
    [4.37, 50.87],
  ];

  it('takes out the pin at that position and closes the gap', () => {
    expect(removePinAt(THREE_PINS, 1)).toEqual([
      [4.35, 50.85],
      [4.37, 50.87],
    ]);
  });

  it('clears the answer when the last pin goes, as an empty MultiPoint has no WKT', () => {
    expect(removePinAt([[4.35, 50.85]], 0)).toBeUndefined();
  });

  it('leaves the pins alone when the position is not one of them', () => {
    expect(removePinAt(THREE_PINS, 7)).toEqual(THREE_PINS);
  });
});

describe('handleMapClickMultipoint', () => {
  // handleMapClickMultipoint reads the pins already on the map and the point
  // that was clicked; a real MapView needs a browser to draw into.
  const mapViewWithPins = (coordinates: number[][]) =>
    fakeMapViewWith(userInputLayerWithPins(coordinates));

  const clickAt = (longitude: number, latitude: number) => ({
    mapPoint: { longitude, latitude },
  });

  it('adds the clicked location to the pins already there', () => {
    const handleMultiPointChange = jest.fn();

    handleMapClickMultipoint(
      clickAt(4.36, 50.86),
      mapViewWithPins([[4.35, 50.85]]),
      handleMultiPointChange
    );

    expect(handleMultiPointChange).toHaveBeenCalledWith([
      [4.35, 50.85],
      [4.36, 50.86],
    ]);
  });

  it('moves the pin instead of adding one when a single location is allowed', () => {
    const handleMultiPointChange = jest.fn();

    handleMapClickMultipoint(
      clickAt(4.36, 50.86),
      mapViewWithPins([[4.35, 50.85]]),
      handleMultiPointChange,
      1
    );

    expect(handleMultiPointChange).toHaveBeenCalledWith([[4.36, 50.86]]);
  });

  it('keeps adding pins when the limit is above one', () => {
    const handleMultiPointChange = jest.fn();

    handleMapClickMultipoint(
      clickAt(4.36, 50.86),
      mapViewWithPins([[4.35, 50.85]]),
      handleMultiPointChange,
      3
    );

    expect(handleMultiPointChange).toHaveBeenCalledWith([
      [4.35, 50.85],
      [4.36, 50.86],
    ]);
  });
});
