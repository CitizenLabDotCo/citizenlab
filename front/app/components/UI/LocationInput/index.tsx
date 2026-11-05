import React, { useCallback, useMemo } from 'react';

import {
  Box,
  Icon,
  Text,
  bo,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import { debounce } from 'lodash-es';
import { SelectInstance } from 'react-select';
import AsyncSelect from 'react-select/async';
import { DefaultTheme, useTheme } from 'styled-components';

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
  setRef?: (arg: SelectInstance<any, boolean> | null) => void;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
  variant?: 'default' | 'bo';
};

const boSelectStyles = (theme: DefaultTheme) => {
  const base = selectStyles(theme, { fontSize: fontSizes.xs, minHeight: 36 });

  return {
    ...base,
    control: (styles, state) => ({
      ...base.control(styles, state),
      borderWidth: '1px',
      borderColor: state.isFocused
        ? theme.colors.tenantPrimary
        : colors.grey300,
      borderRadius: bo.borderRadius,
      paddingLeft: '22px',
      '&:hover': {
        borderColor: state.isFocused
          ? theme.colors.tenantPrimary
          : colors.grey300,
      },
    }),
    singleValue: (styles) => ({
      ...styles,
      color: bo.colors.textHeadingStrong,
    }),
    dropdownIndicator: () => ({ display: 'none' }),
  };
};

const LocationInput = (props: LocationInputProps) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const theme = useTheme();
  const {
    setRef,
    ariaInvalid,
    ariaDescribedBy,
    variant = 'default',
    ...rest
  } = props;

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

  const select = (
    <AsyncSelect
      id="e2e-location-input"
      defaultOptions={defaultOptions}
      loadOptions={promiseOptions}
      styles={variant === 'bo' ? boSelectStyles(theme) : selectStyles(theme)}
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
          <Text
            m="0"
            color={variant === 'bo' ? 'coolGrey500' : 'coolGrey600'}
            fontSize={variant === 'bo' ? 'xs' : undefined}
          >
            {props.placeholder}
          </Text>
        ) : undefined
      }
    />
  );

  if (variant === 'default') return select;

  return (
    <Box position="relative">
      {select}
      <Box
        position="absolute"
        left="11px"
        top="50%"
        display="flex"
        transform="translateY(-50%)"
        pointerEvents="none"
      >
        <Icon
          name="search"
          width="15px"
          height="15px"
          fill={colors.coolGrey500}
          ariaHidden
        />
      </Box>
    </Box>
  );
};

export default LocationInput;
