import React, { useMemo, FC, useEffect } from 'react';
import ReactSelect from 'react-select';

// components
import { Box } from '@citizenlab/cl2-component-library';

// styling
import selectStyles from 'components/UI/MultipleSelect/styles';

// utils
import { debounce } from 'lodash-es';
import { getOptionId } from './utils';

// typings
import { IUserData } from 'api/users/types';
import { Option } from './typings';

interface Props {
  id?: string;
  inputId?: string;
  value: IUserData | null;
  inputValue?: string;
  placeholder: string;
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
  inputId,
  value,
  inputValue,
  placeholder,
  options,
  components,
  getOptionLabel,
  onMenuOpen,
  onInputChange,
  onMenuScrollToBottom,
  onChange,
}: Props) => {
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
        styles={selectStyles}
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
