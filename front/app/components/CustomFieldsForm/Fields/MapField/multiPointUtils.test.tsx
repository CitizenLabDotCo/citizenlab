import { convertGeojsonToWKT, convertWKTToGeojson } from './multiPointUtils';

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
});
