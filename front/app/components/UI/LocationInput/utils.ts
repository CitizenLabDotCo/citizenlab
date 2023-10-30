export function isValidCoordinate(coordStr) {
  // Regular expression to match a valid coordinate pattern
  const coordinatePattern = /^[-+]?\d+(\.\d+)?,\s*[-+]?\d+(\.\d+)?$/;

  // Check if the string matches the valid pattern
  if (!coordinatePattern.test(coordStr)) {
    return false;
  }

  // Split the string into latitude and longitude parts
  const [latitude, longitude] = coordStr.split(',').map(parseFloat);

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
