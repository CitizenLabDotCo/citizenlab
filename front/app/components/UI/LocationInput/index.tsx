import React from 'react';
import AsyncSelect from 'react-select/async';
import selectStyles from 'components/UI/MultipleSelect/styles';
import fetcher from 'utils/cl-react-query/fetcher';

export interface Option {
  label: string;
  value: string;
}

type TextSearchResponse = {
  data: {
    type: string;
    attributes: {
      results:
        | {
            formatted_address: string;
          }[]
        | undefined;
    };
  };
};

const LocationInput = (props: React.ComponentProps<typeof AsyncSelect>) => {
  const promiseOptions = async (inputValue: string) => {
    try {
      const response = await fetcher<TextSearchResponse>({
        path: '/location/textsearch',
        action: 'get',
        queryParams: {
          query: inputValue || props.value,
        },
      });

      return (
        response.data.attributes.results?.map((item) => ({
          label: item,
          value: item,
        })) || []
      );
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
