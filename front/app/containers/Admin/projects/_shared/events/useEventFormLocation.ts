import { useEffect, useRef, useState } from 'react';

import { geocode } from 'utils/locationTools';

interface Options {
  changedAddress?: string | null;
  savedPoint: GeoJSON.Point | null;
  markDirty: () => void;
}

const useEventFormLocation = ({
  changedAddress,
  savedPoint,
  markDirty,
}: Options) => {
  const [locationPoint, setLocationPoint] = useState<GeoJSON.Point | null>();
  const [geocodedPoint, setGeocodedPoint] = useState<GeoJSON.Point | null>(
    null
  );
  const geocodedAddress = useRef<string | null>();

  useEffect(() => {
    if (
      changedAddress === undefined ||
      geocodedAddress.current === changedAddress
    ) {
      return;
    }

    let cancelled = false;
    const timeout = setTimeout(async () => {
      if (geocodedAddress.current === changedAddress) return;
      const point = changedAddress ? await geocode(changedAddress) : null;
      if (cancelled || geocodedAddress.current === changedAddress) return;
      geocodedAddress.current = changedAddress;
      setGeocodedPoint(point);
      setLocationPoint(point);
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [changedAddress]);

  // Saving right after an address change must not wait for the delayed
  // lookup above, or the event is saved with the previous point.
  const locationPointToSave = async () => {
    if (
      changedAddress === undefined ||
      geocodedAddress.current === changedAddress
    ) {
      return locationPoint;
    }

    const point = changedAddress ? await geocode(changedAddress) : null;
    geocodedAddress.current = changedAddress;
    setGeocodedPoint(point);
    setLocationPoint(point);
    return point;
  };

  const markPointSaved = (point: GeoJSON.Point | null | undefined) =>
    setLocationPoint((current) => (current === point ? undefined : current));

  return {
    hasLocationPoint: !!(locationPoint === undefined
      ? savedPoint
      : locationPoint),
    mapPosition: geocodedPoint ?? savedPoint,
    moveLocationPoint: (point: GeoJSON.Point) => {
      markDirty();
      setLocationPoint(point);
    },
    locationPointToSave,
    markPointSaved,
  };
};

export default useEventFormLocation;
