import React, { useMemo, FC } from 'react';
import ReactSelect from 'react-select';

// components
import { Box } from '@citizenlab/cl2-component-library';

// styling
import selectStyles from 'components/UI/MultipleSelect/styles';

// utils
import { debounce } from 'lodash-es';
import { getOptionId, optionIsUser } from './utils';

// typings
import { IUserData } from 'api/users/types';
import { Option } from './typings';

interface Props {
  id?: string;
  inputId?: string;
  value: IUserData | null;
  placeholder: string;
  options: (IUserData | { value: string })[];
  components?: { Option: FC };
  getOptionLabel: (option: Option) => JSX.Element;
  onMenuOpen: () => void;
  onInputChange: (searchTerm: string) => void;
  onMenuScrollToBottom: () => void;
  onChange: (option: IUserData | undefined) => void;
}

const BaseUserSelect = ({
  id,
  inputId,
  value,
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

  const handleChange = (
    option: Option,
    { action }: { action: 'clear' | 'select-option' }
  ) => {
    if (action === 'clear') {
      onChange(undefined);
      return;
    }

    if (optionIsUser(option)) {
      onChange(option);
    }
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
        onChange={handleChange}
      />
    </Box>
  );
};

export default BaseUserSelect;
