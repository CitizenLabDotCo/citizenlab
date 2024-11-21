import React, { useState, useMemo } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { debounce } from 'lodash-es';
import ReactSelect from 'react-select';

import { IAdminPublicationData } from 'api/admin_publications/types';
import useAdminPublications from 'api/admin_publications/useAdminPublications';

import selectStyles from 'components/UI/MultipleSelect/styles';

import OptionLabel from './OptionLabel';
import { getOptionId } from './utils';

interface Props {
  onChange: (option?: IAdminPublicationData) => void;
}

const AdminPublicationSearchInput = ({ onChange }: Props) => {
  const [visibleSearchTerm, setVisibleSearchTerm] = useState('');
  const [search, setSearch] = useState('');

  const {
    data: adminPublications,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAdminPublications({
    search,
    publicationStatusFilter: ['published', 'archived'],
    pageSize: 6,
  });

  const adminPublicationsFlat =
    adminPublications?.pages.flatMap((page) => page.data) ?? [];

  const inputChangeDebounced = useMemo(() => {
    return debounce((searchTerm: string) => {
      setSearch(searchTerm);
    }, 200);
  }, []);

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
        options={
          hasNextPage
            ? [...adminPublicationsFlat, { value: 'loadMore' }]
            : adminPublicationsFlat
        }
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
        styles={selectStyles()}
        filterOption={() => true}
        // components={components}
        onInputChange={handleInputChange}
        onMenuScrollToBottom={() => {
          if (hasNextPage) {
            fetchNextPage();
          }
        }}
        onChange={onChange}
      />
    </Box>
  );
};

export default AdminPublicationSearchInput;
