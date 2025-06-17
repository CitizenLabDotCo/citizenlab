import React from 'react';

import {
  Box,
  CheckboxWithLabel,
  colors,
  SelectProps,
  Text,
} from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';
import { darken } from 'polished';
import { Controller, useFormContext } from 'react-hook-form';
import styled, { useTheme } from 'styled-components';
import { CLError, IOption, RHFErrors } from 'typings';

import Error, { TFieldName } from 'components/UI/Error';

import { ScreenReaderOnly } from 'utils/a11y';
interface Props extends Omit<SelectProps, 'onChange'> {
  name: string;
  options: IOption[];
  scrollErrorIntoView?: boolean;
  title: string;
}

const StyledBox = styled(Box)`
  cursor: pointer;
  background-color: ${colors.grey100};
  &:hover {
    background-color: ${darken(0.05, colors.grey100)};
  }
`;

const CheckboxMultiSelect = ({
  name,
  options,
  scrollErrorIntoView,
  title,
}: Props) => {
  const {
    trigger,
    watch,
    setValue,
    formState: { errors: formContextErrors },
    control,
  } = useFormContext();
  const errors = get(formContextErrors, name) as RHFErrors;
  const validationError = errors?.message;

  // If an API error with a matching name has been returned from the API response, apiError is set to an array with the error message as the only item
  const apiError = errors?.error && ([errors] as CLError[]);
  const theme = useTheme();
  const checkedOptions = watch(name) || [];

  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({ field: { ref: _ref } }) => {
          return (
            <Box display="block" as="fieldset" border="none" p="0px">
              <ScreenReaderOnly>
                <legend>{title}</legend>
              </ScreenReaderOnly>
              {options.map((option) => (
                <StyledBox
                  style={{ cursor: 'pointer' }}
                  mb="12px"
                  border={
                    checkedOptions.includes(option.value)
                      ? `2px solid ${theme.colors.tenantPrimary}`
                      : `1px solid ${theme.colors.tenantPrimary}`
                  }
                  background={theme.colors.tenantPrimaryLighten95}
                  key={option.value}
                  borderRadius="3px"
                >
                  <CheckboxWithLabel
                    size="20px"
                    padding="18px 20px 18px 20px"
                    checkedColor={'tenantPrimary'}
                    label={
                      <Text m="0px" color={'tenantPrimary'}>
                        {option.label}
                      </Text>
                    }
                    checked={checkedOptions.includes(option.value)}
                    usePrimaryBorder={true}
                    onChange={() => {
                      if (checkedOptions.includes(option.value)) {
                        setValue(
                          name,
                          checkedOptions.filter(
                            (value: string) => value !== option.value
                          )
                        );
                      } else {
                        setValue(name, [...checkedOptions, option.value]);
                      }
                      trigger(name);
                    }}
                  />
                </StyledBox>
              ))}
            </Box>
          );
        }}
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
          fieldName={name as TFieldName}
          apiErrors={apiError}
          marginTop="8px"
          marginBottom="8px"
          scrollIntoView={scrollErrorIntoView}
        />
      )}
    </>
  );
};

export default CheckboxMultiSelect;
