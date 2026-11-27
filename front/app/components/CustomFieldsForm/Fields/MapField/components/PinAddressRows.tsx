import React, { useState } from 'react';

import { Box, colors, IconButton } from '@citizenlab/cl2-component-library';

import useCacheAddressForPoint from 'api/reverse_geocode/useCacheAddressForPoint';
import useReverseGeocodedAddresses from 'api/reverse_geocode/useReverseGeocodedAddresses';

import useLocale from 'hooks/useLocale';

import Error from 'components/UI/Error';
import LocationInput, { Option } from 'components/UI/LocationInput';

import { useIntl } from 'utils/cl-intl';
import { geocode } from 'utils/locationTools';

import messages from '../../../messages';
import { exceedsPinLimit } from '../multiPointUtils';

import rowMessages from './messages';
import PinNumberBadge from './PinNumberBadge';

type RowMark = {
  index: number;
  pinCount: number;
};

type Props = {
  coordinates: number[][];
  maxPins?: number;
  onAddPin: (point: GeoJSON.Point) => void;
  onReplacePin: (index: number, point: GeoJSON.Point) => void;
  onRemovePin: (index: number) => void;
};

const PinAddressRows = ({
  coordinates,
  maxPins,
  onAddPin,
  onReplacePin,
  onRemovePin,
}: Props) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const addresses = useReverseGeocodedAddresses(coordinates, locale);
  const cacheAddressForPoint = useCacheAddressForPoint();

  // Both of these belong to one row, which is named by its position. A pin
  // added or taken off in the meantime renumbers the rows, so each carries
  // the number of pins it was recorded against and is ignored once that
  // number no longer holds.
  const [pending, setPending] = useState<RowMark & { option: Option }>();
  const [failed, setFailed] = useState<RowMark>();

  const marks = (index: number): RowMark => ({
    index,
    pinCount: coordinates.length,
  });

  const isStillOnRow = (mark: RowMark | undefined, index: number) =>
    mark?.index === index && mark.pinCount === coordinates.length;

  // The trailing empty row is the way to add a pin by address, so it is only
  // offered while there is room for another pin.
  const hasRoomForAnother = !exceedsPinLimit(coordinates.length + 1, maxPins);

  const slots = coordinates.map((_, index) => ({ index, isFilled: true }));
  if (hasRoomForAnother) {
    slots.push({ index: coordinates.length, isFilled: false });
  }

  const handleChange = async (
    index: number,
    isFilled: boolean,
    option: Option | null
  ) => {
    if (!option?.value) {
      return;
    }

    setPending({ ...marks(index), option });
    setFailed(undefined);

    const point = await geocode(option.value);

    setPending(undefined);

    if (!point) {
      setFailed(marks(index));
      return;
    }

    const [lng, lat] = point.coordinates;
    // What somebody picked is the address to show, so it is kept against its
    // own coordinates instead of being looked up again.
    cacheAddressForPoint({ lat, lng, language: locale }, option.value);

    // Which row this is was settled when it was drawn, so a pin that arrived
    // in the meantime cannot turn an addition into a replacement.
    if (isFilled) {
      onReplacePin(index, point);
    } else {
      onAddPin(point);
    }
  };

  const valueFor = (index: number) => {
    if (isStillOnRow(pending, index)) {
      return pending?.option ?? null;
    }

    const address = addresses[index]?.address;
    return address ? { value: address, label: address } : null;
  };

  return (
    <Box>
      {slots.map(({ index, isFilled }) => {
        const isLookingUpAddress =
          isStillOnRow(pending, index) || !!addresses[index]?.isLoading;

        return (
          <Box key={index} mb="8px" data-cy="e2e-pin-address-row">
            <Box display="flex" alignItems="center" gap="8px">
              <PinNumberBadge number={index + 1} isFilled={isFilled} />
              <Box flex="1">
                <LocationInput
                  // LocationInput carries an id of its own, which would be the
                  // same on every row without this.
                  id={`e2e-pin-address-input-${index}`}
                  value={valueFor(index)}
                  isLoading={isLookingUpAddress}
                  // The trash button is how a pin goes away, so clearing the
                  // field would be a second, less obvious way to do it.
                  isClearable={false}
                  onChange={(option: Option | null) => {
                    handleChange(index, isFilled, option);
                  }}
                  placeholder={formatMessage(
                    isFilled && isLookingUpAddress
                      ? rowMessages.lookingUpAddress
                      : messages.addressInputPlaceholder
                  )}
                  aria-label={formatMessage(rowMessages.pinAddressLabel, {
                    number: index + 1,
                  })}
                />
              </Box>
              {isFilled ? (
                <IconButton
                  iconName="delete"
                  iconColor={colors.coolGrey600}
                  iconColorOnHover={colors.red600}
                  buttonType="button"
                  a11y_buttonActionMessage={formatMessage(
                    rowMessages.removeLocation,
                    { number: index + 1 }
                  )}
                  onClick={() => {
                    onRemovePin(index);
                  }}
                />
              ) : (
                // Keeps the address fields of every row the same width.
                <Box width="24px" flexShrink={0} />
              )}
            </Box>
            {isStillOnRow(failed, index) && (
              <Error
                marginTop="4px"
                text={formatMessage(rowMessages.addressNotFound)}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default PinAddressRows;
