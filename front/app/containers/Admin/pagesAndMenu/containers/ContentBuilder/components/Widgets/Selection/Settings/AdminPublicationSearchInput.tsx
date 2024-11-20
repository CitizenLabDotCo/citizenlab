import React, { useMemo } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { debounce } from 'lodash-es';
import ReactSelect from 'react-select';

import { IAdminPublicationData } from 'api/admin_publications/types';

import selectStyles from 'components/UI/MultipleSelect/styles';

interface Props {
  options: IAdminPublicationData[];
  searchInputValue: string;
  onChange: (option?: IAdminPublicationData) => void;
  onSearchInputChange: (searchTerm: string) => void;
}

const AdminPublicationSearchInput = ({
  options,
  searchInputValue,
  onChange,
  onSearchInputChange,
}: Props) => {
  const handleInputChange = useMemo(() => {
    return debounce((searchTerm: string) => {
      onSearchInputChange(searchTerm);
    }, 500);
  }, [onSearchInputChange]);

  return (
    <Box>
      <ReactSelect
        // id={id}
        // inputId={inputId}
        isSearchable
        blurInputOnSelect
        backspaceRemovesValue={false}
        menuShouldScrollIntoView={false}
        inputValue={searchInputValue}
        placeholder={''}
        options={options}
        // getOptionValue={getOptionId}
        // getOptionLabel={getOptionLabel}
        menuPlacement="auto"
        styles={selectStyles()}
        filterOption={() => true}
        // components={components}
        onInputChange={handleInputChange}
        // onMenuScrollToBottom={onMenuScrollToBottom}
        onChange={onChange}
      />
    </Box>
  );
};

export default AdminPublicationSearchInput;
