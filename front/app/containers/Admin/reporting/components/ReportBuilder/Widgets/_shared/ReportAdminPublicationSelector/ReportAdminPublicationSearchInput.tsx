import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import ReactSelect from 'react-select';
import { useTheme } from 'styled-components';

import { IAdminPublicationData } from 'api/admin_publications/types';
import useAdminPublications from 'api/admin_publications/useAdminPublications';
import { PublicationStatus } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import selectStyles from 'components/UI/MultipleSelect/styles';

import ReportAdminPublicationOptionLabel from './ReportAdminPublicationOptionLabel';
import {
  LoadMore,
  getOptionId,
  getOptions,
  isAdminPublication,
  getAllDescendantIds,
} from './utils';

interface Props {
  adminPublicationIds: string[];
  publicationStatusFilter?: PublicationStatus[];
  folderId?: string;
  onChange: (newIds: string[]) => void;
}

const ReportAdminPublicationSearchInput = ({
  adminPublicationIds,
  publicationStatusFilter,
  folderId,
  onChange,
}: Props) => {
  const [search, setSearch] = useState('');
  const theme = useTheme();
  const localize = useLocalize();

  const {
    data: adminPublications,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAdminPublications({
    search,
    publicationStatusFilter,
    childrenOfId: folderId,
    pageSize: 10,
  });

  const handleInputChange = (searchTerm: string) => {
    setSearch(searchTerm);
  };

  const options = getOptions(
    adminPublications,
    adminPublicationIds,
    hasNextPage,
    localize
  );

  const allAdminPublications =
    adminPublications?.pages.flatMap((page) => page.data) ?? [];

  const handleChange = (option: IAdminPublicationData | LoadMore | null) => {
    if (!option || !isAdminPublication(option)) return;

    const isFolder = option.relationships.publication.data.type === 'folder';
    const newIds = [option.id];

    if (isFolder) {
      const descendantIds = getAllDescendantIds(
        option.id,
        allAdminPublications
      );
      newIds.push(...descendantIds);
    }

    onChange([...adminPublicationIds, ...newIds]);
  };

  return (
    <Box>
      <ReactSelect
        inputId="report-admin-publication-search-input"
        isSearchable
        backspaceRemovesValue={false}
        menuShouldScrollIntoView={true}
        value={null}
        inputValue={search}
        placeholder={''}
        options={options}
        getOptionValue={getOptionId}
        formatOptionLabel={(option) => (
          <ReportAdminPublicationOptionLabel
            option={option}
            hasNextPage={hasNextPage}
            isLoading={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
          />
        )}
        menuPlacement="top"
        menuPortalTarget={document.body}
        styles={{
          ...selectStyles(theme),
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
        filterOption={() => true}
        onInputChange={handleInputChange}
        onMenuScrollToBottom={() => {
          if (hasNextPage) {
            fetchNextPage();
          }
        }}
        onChange={handleChange}
        closeMenuOnScroll={false}
        closeMenuOnSelect={false}
      />
    </Box>
  );
};

export default ReportAdminPublicationSearchInput;
