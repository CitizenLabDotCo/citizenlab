import React, { useCallback, useEffect } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';
import { Controller, useFormContext } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { CLError, RHFErrors } from 'typings';

import useLocale from 'hooks/useLocale';

import Error, { TFieldName } from 'components/UI/Error';
import {
  default as LocationInputComponent,
  LocationInputProps,
  Option,
} from 'components/UI/LocationInput';

import { geocode, Point, reverseGeocode } from 'utils/locationTools';

interface Props extends LocationInputProps {
  name: string;
  fieldName?: TFieldName;
  scrollErrorIntoView?: boolean;
}

const LocationInput = ({
  name,
  fieldName,
  scrollErrorIntoView,
  ...rest
}: Props) => {
  const {
    formState: { errors: formContextErrors, touchedFields },
    control,
    setValue,
    trigger,
    watch,
  } = useFormContext();
  const locale = useLocale();
  const [searchParams] = useSearchParams();
  const latitude = searchParams.get('lat');
  const longitude = searchParams.get('lng');

  const errors = get(formContextErrors, name) as RHFErrors;
  const validationError = errors?.message;

  // If an API error with a matching name has been returned from the API response, apiError is set to an array with the error message as the only item
  const apiError = errors?.error && ([errors] as CLError[]);

  const getLocationGeojson = async (location_description: string) => {
    let location_point_geojson: Point | null = null;
    if (location_description) {
      location_point_geojson = await geocode(location_description);
    }
    return location_point_geojson;
  };

  const getLocationDescription = useCallback(async () => {
    let location_description: string | undefined;

    if (latitude && longitude) {
      // If the user has provided a location, we use that
      const lat = Number(latitude);
      const lng = Number(longitude);
      location_description = await reverseGeocode(lat, lng, locale);
    }

    return location_description;
  }, [latitude, longitude, locale]);

  const locationDescription = watch(name);

  useEffect(() => {
    if (latitude && longitude && !touchedFields[name]) {
      const fetchLocationDescription = async () => {
        const location_description = await getLocationDescription();
        if (location_description) {
          setValue(name, location_description);

          setValue('location_point_geojson', {
            type: 'Point',
            coordinates: [longitude, latitude],
          });
        }
      };

      fetchLocationDescription();
    }
  }, [
    latitude,
    longitude,
    locale,
    name,
    setValue,
    locationDescription,
    getLocationDescription,
    touchedFields,
  ]);

  useEffect(() => {
    if (locationDescription) {
      getLocationGeojson(locationDescription).then((location_point_geojson) => {
        setValue('location_point_geojson', {
          ...location_point_geojson,
        });
      });
    } else {
      setValue('location_point_geojson', {});
    }
  }, [locationDescription, setValue]);

  const value = locationDescription
    ? {
        label: locationDescription,
        value: locationDescription,
      }
    : null;

  return (
    <Box width="100%">
      <Controller
        name={name}
        control={control}
        render={({ field: { ref: _ref, ...field } }) => (
          <LocationInputComponent
            className="e2e-idea-form-location-input-field"
            inputId={name}
            {...field}
            {...rest}
            form={'_none'}
            value={value}
            placeholder=" "
            onChange={async (option: Option | null) => {
              setValue(name, option?.value || null, {
                shouldTouch: true,
              });
              trigger(name);
            }}
          />
        )}
      />
      {validationError && (
        <Error
          marginTop="8px"
          marginBottom="8px"
          text={validationError}
          scrollIntoView={scrollErrorIntoView}
        />
      )}
      {apiError && (
        <Error
          fieldName={fieldName || (name as TFieldName)}
          apiErrors={apiError}
          marginTop="8px"
          marginBottom="8px"
          scrollIntoView={scrollErrorIntoView}
        />
      )}
    </Box>
  );
};

export default LocationInput;
