import React, { useCallback, useMemo } from 'react';

import { Text } from '@citizenlab/cl2-component-library';
import { debounce } from 'lodash-es';
import { SelectInstance } from 'react-select';
import AsyncSelect from 'react-select/async';
import { useTheme } from 'styled-components';

import useLocale from 'hooks/useLocale';

import selectStyles from 'components/UI/MultipleSelect/styles';

import { useIntl } from 'utils/cl-intl';

import fetchLocationOptions from './fetchLocationOptions';
import messages from './messages';

export interface Option {
  label: string;
  value: string;
}

export type LocationInputProps = React.ComponentProps<typeof AsyncSelect> & {
  value?: Option | null;
  setRef?: (arg: SelectInstance<any, boolean> | null) => void;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
};

const LocationInput = (props: LocationInputProps) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const theme = useTheme();
  const { setRef, ariaInvalid, ariaDescribedBy, ...rest } = props;

  const defaultOptions = props.value
    ? [{ label: props.value.value, value: props.value.value }]
    : [];

  const fetchOptions = useCallback(
    (inputValue: string) => fetchLocationOptions(inputValue, locale),
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
      {...rest}
      ref={(instance) => {
        setRef?.(instance);
      }}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedBy}
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
