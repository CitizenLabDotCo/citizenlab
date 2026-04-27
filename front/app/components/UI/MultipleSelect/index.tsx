import React, { KeyboardEvent, useRef } from 'react';

import {
  Box,
  Label,
  fontSizes,
  colors,
} from '@citizenlab/cl2-component-library';
import ReactSelect from 'react-select';
import { useTheme } from 'styled-components';
import { IOption } from 'typings';

import selectStyles from 'components/UI/MultipleSelect/styles';

export type Props = {
  id?: string;
  inputId?: string;
  value: IOption[] | null | IOption['value'];
  placeholder?: string | JSX.Element;
  options: IOption[] | null;
  autoBlur?: boolean;
  onChange: (arg: IOption[]) => void;
  disabled?: boolean;
  className?: string;
  label?: React.ReactNode;
  isSearchable?: boolean;
};

const MultipleSelect = ({
  id,
  inputId,
  value,
  placeholder,
  options,
  autoBlur,
  onChange,
  disabled,
  className,
  label,
  isSearchable,
}: Props) => {
  const theme = useTheme();
  const selectRef = useRef<any>(null);

  const handleOnChange = (newValue: IOption[]) => {
    onChange(newValue);
  };

  //  Needed to keep our API compatible with react-select v1
  //  For a native react-select solution, follow this issue:
  //  https://github.com/JedWatson/react-select/issues/2669
  const findFullOptionValue = (value) => {
    if (typeof value === 'string') {
      return options && options.find((option) => option.value === value);
    }

    return value;
  };

  const findFullOptionValues = () => {
    if (Array.isArray(value)) {
      return value.map(findFullOptionValue);
    }

    return value;
  };

  const preventModalCloseOnEscape = (event: KeyboardEvent) => {
    if (event.code === 'Escape') event.stopPropagation();
  };

  // to prevent jumping to another component when pressing Enter key
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const handleRemoveValue = (event: React.KeyboardEvent) => {
    preventModalCloseOnEscape(event);

    if (event.key === 'Enter') {
      const focusedValue = selectRef.current?.state?.focusedValue;

      if (focusedValue) {
        event.preventDefault();
        event.stopPropagation();

        const currentValues = findFullOptionValues();
        if (Array.isArray(currentValues)) {
          const newValues = currentValues.filter(
            (val) => val.value !== focusedValue.value
          );
          onChange(newValues);
        }
      }
    }
  };

  return (
    <Box onKeyDown={handleKeyDown}>
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <ReactSelect
        ref={selectRef}
        id={id}
        inputId={inputId}
        className={className}
        isMulti
        isSearchable={isSearchable}
        blurInputOnSelect={typeof autoBlur === 'boolean' ? autoBlur : false}
        backspaceRemovesValue={true}
        menuShouldScrollIntoView={false}
        isClearable={false}
        value={findFullOptionValues()}
        placeholder={placeholder || ''}
        options={options || []}
        isOptionDisabled={(option) => option.disabled}
        onChange={handleOnChange}
        isDisabled={disabled}
        styles={{
          ...selectStyles(theme),
          menuPortal: (base) => ({
            ...base,
            // zIndex needed so dropdown is not overlapped by
            // subsequent dropdown questions (see TAN-4671).
            zIndex: 1001,
          }),
          option: (base, state) => ({
            ...base,
            cursor: state.isDisabled ? 'not-allowed' : 'pointer',
            opacity: state.isDisabled ? 0.8 : 1,
            fontSize: `${fontSizes.base}px`,
            color: state.isFocused ? colors.textPrimary : colors.textSecondary,
            backgroundColor: state.isFocused
              ? colors.grey300
              : state.isDisabled
              ? colors.grey100
              : '#fff',
          }),
        }}
        menuPosition="fixed"
        menuPlacement="auto"
        hideSelectedOptions
        onKeyDown={handleRemoveValue}
      />
    </Box>
  );
};

export default MultipleSelect;
