import React, { KeyboardEvent, useRef } from 'react';

import {
  Box,
  Label,
  fontSizes,
  colors,
} from '@citizenlab/cl2-component-library';
import ReactSelect, { SelectInstance } from 'react-select';
import { useTheme } from 'styled-components';
import { IOption } from 'typings';

import selectStyles from './styles';

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
  setRef?: (arg: SelectInstance<IOption, true> | null) => void;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
  fontSize?: number;
  minHeight?: number;
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
  setRef,
  ariaInvalid,
  ariaDescribedBy,
  fontSize = fontSizes.base,
  minHeight,
}: Props) => {
  const theme = useTheme();
  const selectRef = useRef<SelectInstance<IOption, true>>(null);
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

  const handleSelectKeyDown = (event: KeyboardEvent) => {
    preventModalCloseOnEscape(event);

    if (event.key !== 'Enter') return;

    const select = selectRef.current;
    const focusedValue = select?.state.focusedValue;
    if (!select || !focusedValue) return;

    event.preventDefault();
    event.stopPropagation();
    select.removeValue(focusedValue);
  };

  return (
    <Box onKeyDown={handleKeyDown}>
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <ReactSelect
        ref={(instance) => {
          (
            selectRef as React.MutableRefObject<SelectInstance<
              IOption,
              true
            > | null>
          ).current = instance;
          setRef?.(instance);
        }}
        id={id}
        inputId={inputId}
        className={className}
        isMulti
        isSearchable={isSearchable}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
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
          ...selectStyles(theme, { fontSize, minHeight }),
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
            fontSize: `${fontSize}px`,
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
        onKeyDown={handleSelectKeyDown}
      />
    </Box>
  );
};

export default MultipleSelect;
