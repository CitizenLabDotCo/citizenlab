import { geocodeByAddress, getLatLng } from 'react-places-autocomplete';

export async function convertToGeoJson(location: string) {
  const results = await geocodeByAddress(location);
  const { lat, lng } = await getLatLng(results[0]);
  return {
    type: 'Point',
    coordinates: [lat as number, lng as number]
  };
}
