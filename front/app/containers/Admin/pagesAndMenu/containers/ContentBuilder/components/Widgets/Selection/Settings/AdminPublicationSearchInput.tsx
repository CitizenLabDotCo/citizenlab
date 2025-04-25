import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import ReactSelect from 'react-select';
import { useTheme } from 'styled-components';

import { IAdminPublicationData } from 'api/admin_publications/types';
import useAdminPublications from 'api/admin_publications/useAdminPublications';

import useDebouncedValue from 'hooks/useDebouncedValue';

import selectStyles from 'components/UI/MultipleSelect/styles';

import OptionLabel from './OptionLabel';
import { LoadMore, getOptionId, getOptions } from './utils';

interface Props {
  adminPublicationIds: string[];
  onChange: (option?: IAdminPublicationData | LoadMore) => void;
}

const AdminPublicationSearchInput = ({
  adminPublicationIds,
  onChange,
}: Props) => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const theme = useTheme();

  const {
    data: adminPublications,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAdminPublications({
    search: debouncedSearch,
    publicationStatusFilter: ['published', 'archived'],
    pageSize: 6,
  });

  const handleInputChange = (searchTerm: string) => {
    setSearch(searchTerm);
  };

  const options = getOptions(
    adminPublications,
    adminPublicationIds,
    hasNextPage
  );

  return (
    <Box>
      <ReactSelect
        inputId="admin-publication-search-input"
        isSearchable
        backspaceRemovesValue={false}
        menuShouldScrollIntoView={true}
        value={null}
        inputValue={search}
        placeholder={''}
        options={options}
        getOptionValue={getOptionId}
        getOptionLabel={(option) => (
          <OptionLabel
            option={option}
            hasNextPage={hasNextPage}
            isLoading={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
          />
        )}
        menuPlacement="auto"
        styles={selectStyles(theme)}
        filterOption={() => true}
        onInputChange={handleInputChange}
        onMenuScrollToBottom={() => {
          if (hasNextPage) {
            fetchNextPage();
          }
        }}
        onChange={onChange}
        closeMenuOnScroll={false}
        closeMenuOnSelect={false}
      />
    </Box>
  );
};

export default AdminPublicationSearchInput;
