import React from 'react';

import LocationInput, { Option } from 'components/UI/LocationInput';

import { useIntl } from 'utils/cl-intl';

import messages from '../../../messages';
import { geocodeAndSaveLocation } from '../utils';

type Props = {
  address: Option;
  handlePointChange: (point: GeoJSON.Point | undefined) => void;
};

const LocationTextInput = ({ address, handlePointChange }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <LocationInput
      value={
        address.value && address.label
          ? {
              value: address.value,
              label: address.label,
            }
          : null
      }
      onChange={(location: Option) => {
        // Geocode and save the location
        geocodeAndSaveLocation(location, handlePointChange);
        // Clear the point if the location is empty
        handlePointChange(undefined);
      }}
      placeholder={formatMessage(messages.addressInputPlaceholder)}
      aria-label={formatMessage(messages.addressInputAriaLabel)}
      className="e2e-idea-form-location-input-field"
    />
  );
};

export default LocationTextInput;
