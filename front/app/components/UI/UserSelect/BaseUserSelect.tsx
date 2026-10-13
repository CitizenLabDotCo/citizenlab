import React, { useMemo, FC, useEffect } from 'react';

import { Box, bo, colors, fontSizes } from '@citizenlab/cl2-component-library';
import { debounce } from 'lodash-es';
import ReactSelect from 'react-select';
import { DefaultTheme, useTheme } from 'styled-components';

import { IUserData } from 'api/users/types';

import selectStyles from 'components/UI/MultipleSelect/styles';

import { Option } from './typings';
import { getOptionId } from './utils';

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
    }),
    placeholder: (styles) => ({
      ...styles,
      color: colors.coolGrey500,
    }),
    singleValue: (styles) => ({
      ...styles,
      color: bo.colors.textHeadingStrong,
    }),
  };
};

interface Props {
  id?: string;
  variant?: 'default' | 'bo';
  inputId?: string;
  value: IUserData | null;
  inputValue?: string;
  placeholder?: string;
  options: Option[];
  components?: { Option: FC };
  getOptionLabel: (option: Option) => any;
  onMenuOpen?: () => void;
  /* onInputChange should be a stable reference! */
  onInputChange: (searchTerm: string) => void;
  onMenuScrollToBottom: () => void;
  onChange: (option?: Option) => void;
}

const BaseUserSelect = ({
  id,
  variant = 'default',
  inputId,
  value,
  inputValue,
  placeholder = '',
  options,
  components,
  getOptionLabel,
  onMenuOpen,
  onInputChange,
  onMenuScrollToBottom,
  onChange,
}: Props) => {
  const theme = useTheme();
  const handleInputChange = useMemo(() => {
    return debounce((searchTerm: string) => {
      onInputChange(searchTerm);
    }, 500);
  }, [onInputChange]);

  useEffect(() => {
    return () => {
      handleInputChange.cancel();
    };
  }, [handleInputChange]);

  const handleChange = (
    option: Option,
    { action }: { action: 'clear' | 'select-option' }
  ) => {
    if (action === 'clear') {
      onChange(undefined);
      return;
    }

    onChange(option);
  };

  return (
    <Box data-cy="e2e-user-select">
      <ReactSelect
        id={id}
        inputId={inputId}
        isSearchable
        blurInputOnSelect
        backspaceRemovesValue={false}
        menuShouldScrollIntoView={false}
        isClearable
        value={value}
        inputValue={inputValue}
        placeholder={placeholder}
        options={options}
        getOptionValue={getOptionId}
        getOptionLabel={getOptionLabel}
        menuPlacement="auto"
        styles={variant === 'bo' ? boSelectStyles(theme) : selectStyles(theme)}
        filterOption={() => true}
        components={components}
        onMenuOpen={onMenuOpen}
        onInputChange={handleInputChange}
        onMenuScrollToBottom={onMenuScrollToBottom}
        onChange={handleChange as any}
      />
    </Box>
  );
};

export default BaseUserSelect;
