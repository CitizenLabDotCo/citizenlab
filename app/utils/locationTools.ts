import { geocodeByAddress, getLatLng } from 'react-places-autocomplete';

export async function convertToGeoJson(location: string): Promise<GeoJSON.Point> {
  const results = await geocodeByAddress(location);
  const { lat, lng } = await getLatLng(results[0]);
  return {
    type: 'Point',
    coordinates: [lng as number, lat as number]
  };
}
