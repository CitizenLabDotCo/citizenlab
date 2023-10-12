import React from 'react';
import AsyncSelect from 'react-select/async';
import selectStyles from 'components/UI/MultipleSelect/styles';
import fetcher from 'utils/cl-react-query/fetcher';
import useLocale from 'hooks/useLocale';

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
  const locale = useLocale();
  const promiseOptions = async (inputValue: string) => {
    try {
      const response = await fetcher<TextSearchResponse>({
        path: '/location/autocomplete',
        action: 'get',
        queryParams: {
          input: inputValue || props.value,
          language: locale,
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
