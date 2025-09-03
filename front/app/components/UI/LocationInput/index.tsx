import React, { useState, useEffect } from 'react';

import { Text } from '@citizenlab/cl2-component-library';
import AsyncSelect from 'react-select/async';
import { useTheme } from 'styled-components';

import useLocale from 'hooks/useLocale';

import selectStyles from 'components/UI/MultipleSelect/styles';

import { useIntl } from 'utils/cl-intl';
import fetcher from 'utils/cl-react-query/fetcher';

import messages from './messages';
import { isValidCoordinate } from './utils';

export interface Option {
  label: string;
  value: string;
}

type TextSearchResponse = {
  data: {
    type: string;
    attributes: {
      results: string[] | undefined;
    };
  };
};

export type LocationInputProps = React.ComponentProps<typeof AsyncSelect> & {
  value?: Option | null;
};

const LocationInput = (props: LocationInputProps) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const [defaultOptions, setDefaultOptions] = useState<Option[]>([]);
  const theme = useTheme();

  useEffect(() => {
    const fetchDefaultOptions = async () => {
      try {
        const response = await fetcher<TextSearchResponse>({
          path: '/location/autocomplete',
          action: 'get',
          queryParams: {
            input: props.value?.value,
            language: locale,
          },
        });

        return setDefaultOptions(
          response.data.attributes.results?.map((item) => ({
            label: item,
            value: item,
          })) || []
        );
      } catch (error) {
        return setDefaultOptions([]);
      }
    };

    if (props.value?.value) {
      fetchDefaultOptions();
    }
  }, [locale, props.value?.value]);

  const promiseOptions = async (inputValue: string) => {
    try {
      const response = await fetcher<TextSearchResponse>({
        path: '/location/autocomplete',
        action: 'get',
        queryParams: {
          input: inputValue,
          language: locale,
        },
      });

      const options =
        response.data.attributes.results?.map((item) => ({
          label: item,
          value: item,
        })) || [];

      // Add the inputValue as an option if it is a valid coordinate
      if (isValidCoordinate(inputValue)) {
        options.push({ label: inputValue, value: inputValue });
      }

      return options;
    } catch (error) {
      return [];
    }
  };

  return (
    <AsyncSelect
      id="e2e-location-input"
      defaultOptions={defaultOptions}
      loadOptions={promiseOptions}
      styles={selectStyles(theme)}
      noOptionsMessage={() => formatMessage(messages.noOptions)}
      blurInputOnSelect
      menuShouldScrollIntoView={false}
      isClearable
      openMenuOnClick={false}
      {...props}
      placeholder={
        props.placeholder ? (
          <Text m="0" color="coolGrey600">
            {props.placeholder}
          </Text>
        ) : undefined
      }
    />
  );
};

export default LocationInput;
