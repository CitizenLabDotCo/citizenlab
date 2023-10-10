import React from 'react';
import AsyncSelect, { AsyncProps } from 'react-select/async';
import selectStyles from 'components/UI/MultipleSelect/styles';

export interface Option {
  label: string;
  value: string;
}

const key = process.env.GOOGLE_MAPS_API_KEY;

const LocationInput = (props: AsyncProps) => {
  const promiseOptions = async (inputValue: string) => {
    try {
      const response = await fetch(
        `/json?query=${
          inputValue || props.value
        }&key=${key}&radius=100000000000`,
        {
          method: 'GET',
        }
      );
      const result = await response.json();
      return result.results.map((item) => ({
        label: item.formatted_address,
        value: item.formatted_address,
      }));
    } catch (error) {
      return [];
    }
  };

  return (
    <AsyncSelect
      cacheOptions
      defaultOptions
      loadOptions={promiseOptions}
      styles={selectStyles}
      {...props}
    />
  );
};

export default LocationInput;
