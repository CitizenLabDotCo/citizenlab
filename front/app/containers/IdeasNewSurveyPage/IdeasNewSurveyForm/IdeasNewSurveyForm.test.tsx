import { convertGeojsonToWKT } from './utils';

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
