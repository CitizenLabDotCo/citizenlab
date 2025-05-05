import React from 'react';

import {
  Box,
  colors,
  Radio,
  SelectProps,
  Text,
} from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';
import { darken } from 'polished';
import { Controller, useFormContext } from 'react-hook-form';
import styled, { useTheme } from 'styled-components';
import { CLError, IOption, RHFErrors } from 'typings';

import Error, { TFieldName } from 'components/UI/Error';
interface Props extends Omit<SelectProps, 'onChange'> {
  name: string;
  options: IOption[];
}

const StyledBox = styled(Box)`
  cursor: pointer;
  background-color: ${colors.grey100};
  &:hover {
    background-color: ${darken(0.05, colors.grey100)};
  }
`;

const RadioSingleSelect = ({ name, options, ...rest }: Props) => {
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

  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({ field: { ref: _ref, ...field } }) => {
          return (
            <Box display="block">
              {options.map((option, index: number) => (
                <StyledBox mb="12px" key={option.value} borderRadius="3px">
                  <Radio
                    padding="20px 20px 4px 20px"
                    marginTop="8px"
                    buttonColor={theme.colors.tenantSecondary}
                    id={`${name}-radio-${index}`}
                    name={name}
                    label={
                      <Text p="0px" m="0px" fontSize="s">
                        {option.label}
                      </Text>
                    }
                    currentValue={watch(name)}
                    value={option.value}
                    onChange={(option_key) => {
                      setValue(name, option_key);
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
          scrollIntoView={false}
        />
      )}
      {apiError && (
        <Error
          fieldName={name as TFieldName}
          apiErrors={apiError}
          marginTop="8px"
          marginBottom="8px"
          scrollIntoView={false}
        />
      )}
    </>
  );
};

export default RadioSingleSelect;
