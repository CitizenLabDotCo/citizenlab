import React from 'react';

import { Box, Label } from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';
import { Controller, useFormContext } from 'react-hook-form';
import ReactSelect, { GroupBase, SelectComponentsConfig } from 'react-select';
import { useTheme } from 'styled-components';
import { CLError, IOption, RHFErrors } from 'typings';

import Error, { TFieldName } from 'components/UI/Error';
import selectStyles from 'components/UI/MultipleSelect/styles';
import useA11yMessages from 'components/UI/ReactSelect/useA11yMessages';
import {
  VirtualizedMenuList,
  VirtualizedOption,
} from 'components/UI/ReactSelect/VirtualizedMenu';

const selectComponents: SelectComponentsConfig<
  IOption,
  false,
  GroupBase<IOption>
> = { MenuList: VirtualizedMenuList, Option: VirtualizedOption };

interface Props {
  name: string;
  options: IOption[];
  placeholder?: string | JSX.Element;
  isSearchable?: boolean;
  isClearable?: boolean;
  isDisabled?: boolean;
  required?: boolean;
  blurInputOnSelect?: boolean;
  className?: string;
  label?: React.ReactNode;
  scrollErrorIntoView?: boolean;
  // Optional side effect run after the form value is updated, e.g. to add the
  // selection to a list and clear the field again.
  onChange?: (option: IOption | null) => void;
}

const SearchSelect = ({
  name,
  options,
  placeholder,
  isSearchable = true,
  isClearable = false,
  isDisabled,
  required,
  blurInputOnSelect,
  className,
  label,
  scrollErrorIntoView,
  onChange,
}: Props) => {
  const theme = useTheme();
  const { ariaLiveMessages, noOptionsMessage, screenReaderStatus } =
    useA11yMessages<IOption, false>();
  const {
    trigger,
    setValue,
    formState: { errors: formContextErrors },
    control,
  } = useFormContext();

  const errors = get(formContextErrors, name) as RHFErrors;
  const validationError = errors?.message;

  // If an API error with a matching name has been returned from the API
  // response, apiError is set to an array with the error message as the only item.
  const apiError = errors?.error && ([errors] as CLError[]);

  const ariaDescribedBy =
    validationError || apiError ? `${name}-error` : undefined;

  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({ field: { ref, value }, fieldState }) => {
          // react-select needs the full option, but the form holds only the value.
          const selectedOption =
            value === undefined || value === null || value === ''
              ? null
              : options.find((option) => option.value === value) ?? null;

          return (
            <Box className={className}>
              {label && <Label htmlFor={name}>{label}</Label>}
              <ReactSelect
                ref={ref}
                inputId={name}
                value={selectedOption}
                options={options}
                isSearchable={isSearchable}
                isClearable={isClearable}
                isDisabled={isDisabled}
                required={required}
                blurInputOnSelect={blurInputOnSelect}
                placeholder={placeholder ?? ''}
                aria-invalid={!!fieldState.error}
                aria-describedby={ariaDescribedBy}
                ariaLiveMessages={ariaLiveMessages}
                noOptionsMessage={noOptionsMessage}
                screenReaderStatus={screenReaderStatus}
                components={selectComponents}
                isOptionDisabled={(option) => !!option.disabled}
                menuPosition="fixed"
                menuPlacement="auto"
                menuShouldScrollIntoView={false}
                onChange={(option) => {
                  setValue(name, option?.value ?? '', { shouldDirty: true });
                  trigger(name);
                  onChange?.(option);
                }}
                styles={{
                  ...selectStyles(theme),
                  // Without this the open menu is painted under the control of
                  // the next question on the form (see TAN-4671).
                  menuPortal: (base) => ({ ...base, zIndex: 1001 }),
                  // The focus ring's white shadow lands on the placeholder,
                  // which the search input sits on top of.
                  input: (base) => ({ ...base, input: { boxShadow: 'none' } }),
                }}
              />
            </Box>
          );
        }}
      />
      {validationError && (
        <Error
          id={`${name}-error`}
          marginTop="8px"
          marginBottom="8px"
          text={validationError}
          scrollIntoView={scrollErrorIntoView}
        />
      )}
      {apiError && (
        <Error
          id={`${name}-error`}
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

export default SearchSelect;
