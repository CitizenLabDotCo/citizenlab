import React, { useCallback, useMemo } from 'react';

import { Text } from '@citizenlab/cl2-component-library';
import { debounce } from 'lodash-es';
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
  const theme = useTheme();

  const defaultOptions = props.value
    ? [{ label: props.value.value, value: props.value.value }]
    : [];

  const fetchOptions = useCallback(
    async (inputValue: string) => {
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
    },
    [locale]
  );

  const loadOptions = useMemo(
    () =>
      debounce((inputValue: string, resolve: (options: Option[]) => void) => {
        fetchOptions(inputValue).then(resolve);
      }, 500),
    [fetchOptions]
  );

  const promiseOptions = useCallback(
    (inputValue: string) =>
      new Promise<Option[]>((resolve) => {
        loadOptions(inputValue, resolve);
      }),
    [loadOptions]
  );

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
