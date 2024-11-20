import React, { useState, useMemo } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { debounce } from 'lodash-es';
import ReactSelect from 'react-select';

import { IAdminPublicationData } from 'api/admin_publications/types';

import useLocalize from 'hooks/useLocalize';

import selectStyles from 'components/UI/MultipleSelect/styles';

interface Props {
  options: IAdminPublicationData[];
  searchInputValue: string;
  onChange: (option?: IAdminPublicationData) => void;
  onSearchInputChange: (searchTerm: string) => void;
}

const getOptionId = (option: IAdminPublicationData) => option.id;

const AdminPublicationSearchInput = ({
  options,
  searchInputValue,
  onChange,
  onSearchInputChange,
}: Props) => {
  const localize = useLocalize();
  const [visibleSearchTerm, setVisibleSearchTerm] = useState(searchInputValue);

  const inputChangeDebounced = useMemo(() => {
    return debounce((searchTerm: string) => {
      onSearchInputChange(searchTerm);
    }, 200);
  }, [onSearchInputChange]);

  const handleInputChange = (searchTerm: string) => {
    setVisibleSearchTerm(searchTerm);
    inputChangeDebounced(searchTerm);
  };

  return (
    <Box>
      <ReactSelect
        inputId="admin-publication-search-input"
        isSearchable
        blurInputOnSelect
        backspaceRemovesValue={false}
        menuShouldScrollIntoView={false}
        value={null}
        inputValue={visibleSearchTerm}
        placeholder={''}
        options={options}
        getOptionValue={getOptionId}
        getOptionLabel={(adminPublication) => {
          if (!adminPublication) return '';
          return localize(
            adminPublication.attributes.publication_title_multiloc
          );
        }}
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
