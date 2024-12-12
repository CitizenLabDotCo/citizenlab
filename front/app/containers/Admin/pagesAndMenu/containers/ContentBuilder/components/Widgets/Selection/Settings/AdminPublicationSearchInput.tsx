import React, { useState, useMemo } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { debounce } from 'lodash-es';
import ReactSelect from 'react-select';
import { useTheme } from 'styled-components';

import { IAdminPublicationData } from 'api/admin_publications/types';
import useAdminPublications from 'api/admin_publications/useAdminPublications';

import selectStyles from 'components/UI/MultipleSelect/styles';

import OptionLabel from './OptionLabel';
import { LoadMore, getOptionId, getOptions } from './utils';

interface Props {
  /* adminPublicationsIds is undefined if fetching new selections */
  adminPublicationIds?: string[];
  onChange: (option?: IAdminPublicationData | LoadMore) => void;
}

const AdminPublicationSearchInput = ({
  adminPublicationIds,
  onChange,
}: Props) => {
  const [visibleSearchTerm, setVisibleSearchTerm] = useState('');
  const [search, setSearch] = useState('');
  const theme = useTheme();

  const {
    data: adminPublications,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useAdminPublications({
    search,
    publicationStatusFilter: ['published', 'archived'],
    pageSize: 6,
  });

  const inputChangeDebounced = useMemo(() => {
    return debounce((searchTerm: string) => {
      setSearch(searchTerm);
    }, 200);
  }, []);

  const handleInputChange = (searchTerm: string) => {
    setVisibleSearchTerm(searchTerm);
    inputChangeDebounced(searchTerm);
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
        inputValue={visibleSearchTerm}
        placeholder={''}
        isDisabled={!adminPublicationIds || isFetching}
        options={options}
        getOptionValue={getOptionId}
        getOptionLabel={(option) =>
          (
            <OptionLabel
              option={option}
              hasNextPage={hasNextPage}
              isLoading={isFetchingNextPage}
              fetchNextPage={fetchNextPage}
            />
          ) as any
        }
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
