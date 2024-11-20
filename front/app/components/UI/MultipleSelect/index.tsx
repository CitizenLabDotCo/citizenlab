import React, { KeyboardEvent, useCallback } from 'react';

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

const MultipleSelect: React.FC<Props> = ({
  id,
  inputId,
  value,
  placeholder = '',
  options = [],
  autoBlur = false,
  onChange,
  disabled,
  className,
  label,
  isSearchable = true,
}) => {
  const theme = useTheme();
  const handleOnChange = useCallback(
    (newValue: IOption[]) => {
      onChange(newValue);
    },
    [onChange]
  );

  //  Needed to keep our API compatible with react-select v1
  //  For a native react-select solution, follow this issue:
  //  https://github.com/JedWatson/react-select/issues/2669
  const findFullOptionValue = useCallback(
    (val) => {
      if (typeof val === 'string') {
        return options && options.find((option) => option.value === val);
      }
      return val;
    },
    [options]
  );

  const findFullOptionValues = useCallback(() => {
    if (Array.isArray(value)) {
      return value.map(findFullOptionValue);
    }
    return value;
  }, [value, findFullOptionValue]);

  const preventModalCloseOnEscape = (event: KeyboardEvent) => {
    if (event.code === 'Escape') event.stopPropagation();
  };

  const selectedValue = findFullOptionValues();

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
        value={selectedValue}
        placeholder={placeholder || ''}
        options={options || []}
        onChange={handleOnChange}
        isDisabled={disabled}
        styles={selectStyles(theme)}
        menuPosition="fixed"
        menuPlacement="auto"
        hideSelectedOptions
        onKeyDown={preventModalCloseOnEscape}
      />
    </div>
  );
};

export default MultipleSelect;
