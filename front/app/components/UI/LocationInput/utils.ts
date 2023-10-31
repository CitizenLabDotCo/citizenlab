export function isValidCoordinate(coordStr: string) {
  const cleanedCoordStr = coordStr.replace(/\s/g, '');
  const coordinatePattern = /^[-+]?\d+(\.\d+)?,\s*[-+]?\d+(\.\d+)?$/;

  // Check if the string matches the valid pattern
  if (!coordinatePattern.test(cleanedCoordStr)) {
    return false;
  }

  // Split the string into latitude and longitude parts
  const [latitude, longitude] = cleanedCoordStr.split(',').map(parseFloat);

  // Check if latitude and longitude are within valid ranges
  if (
    isNaN(latitude) ||
    isNaN(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return false;
  }

  return true;
}
