import {
  convertCoordinatesToGeoJSON,
  convertGeojsonToWKT,
  convertWKTToGeojson,
  isLineOrPolygonInput,
  isMultiPointInput,
} from './multiPointUtils';

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
