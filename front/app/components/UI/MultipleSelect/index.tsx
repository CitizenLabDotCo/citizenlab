import React, { KeyboardEvent } from 'react';

import { Label } from '@citizenlab/cl2-component-library';
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

  return (
    <div>
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <ReactSelect
        id={id}
        inputId={inputId}
        className={className}
        isMulti
        isSearchable={isSearchable}
        blurInputOnSelect={typeof autoBlur === 'boolean' ? autoBlur : false}
        backspaceRemovesValue={false}
        menuShouldScrollIntoView={false}
        isClearable={false}
        value={findFullOptionValues()}
        placeholder={placeholder || ''}
        options={options || []}
        onChange={handleOnChange}
        isDisabled={disabled}
        styles={{
          ...selectStyles(theme),
          menuPortal: (base) => ({
            ...base,
            // zIndex needed so dropdown is not overlapped off by
            // subsequent dropdown questions (see TAN-4671).
            zIndex: 1001,
          }),
        }}
        menuPosition="fixed"
        menuPlacement="auto"
        hideSelectedOptions
        onKeyDown={preventModalCloseOnEscape}
      />
    </div>
  );
};

export default MultipleSelect;
