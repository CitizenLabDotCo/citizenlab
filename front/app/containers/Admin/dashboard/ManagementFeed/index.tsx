import React, { useState } from 'react';

import {
  Title,
  Table,
  Thead,
  Th,
  Tr,
  colors,
  Tbody,
  Tfoot,
  Td,
  Box,
  Spinner,
  Text,
} from '@citizenlab/cl2-component-library';

import { IQueryParameters } from 'api/management_feed/types';
import useManagementFeed from 'api/management_feed/useManagementFeed';

import useFeatureFlag from 'hooks/useFeatureFlag';

import ProjectSelector from 'components/admin/ProjectSelector';
import Pagination from 'components/Pagination';
import UserSelect from 'components/UI/UserSelect';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import ManagementFeedRow from './ManagementFeedRow';
import messages from './messages';

const ManagementFeed = () => {
  const [sort, setSort] = useState<IQueryParameters['sort']>('-acted_at');
  const [selectedProjectIds, setSelectedProjects] = useState<string[]>([]);
  const [selectedUserId, setSelectedUser] = useState<string | undefined>();
  const [pageNumber, setPageNumber] = useState(1);
  const { formatMessage } = useIntl();
  const { data: managementFeed } = useManagementFeed({
    pageNumber,
    userIds: selectedUserId ? [selectedUserId] : undefined,
    projectIds: selectedProjectIds.length ? selectedProjectIds : undefined,
    sort,
  });
  const isManagementFeedAllowed = useFeatureFlag({
    name: 'management_feed',
    onlyCheckAllowed: true,
  });

  if (!managementFeed) {
    return <Spinner />;
  }

  const currentPage = getPageNumberFromUrl(managementFeed.links.self);
  const lastPage = getPageNumberFromUrl(managementFeed.links.last);
  if (!isManagementFeedAllowed) {
    return (
      <Box my="20px">
        <Warning>{formatMessage(messages.managementFeedNudge)}</Warning>
      </Box>
    );
  }
  return (
    <>
      <Title color="primary">{formatMessage(messages.title)}</Title>
      <Box my="8px">
        <Warning>{formatMessage(messages.warning)}</Warning>
      </Box>
      <Box display="flex" alignItems="center" my="20px" w="50%">
        <ProjectSelector
          title={formatMessage(messages.project)}
          selectedProjectIds={selectedProjectIds}
          onChange={(projectIds) => setSelectedProjects(projectIds)}
        />
        <Box flex="1">
          <UserSelect
            placeholder={formatMessage(messages.userPlaceholder)}
            selectedUserId={selectedUserId || null}
            onChange={(user) => setSelectedUser(user?.id)}
          />
        </Box>
      </Box>

      {managementFeed.data.length === 0 && (
        <Box my="20px">
          <Text fontSize="l">{formatMessage(messages.noActivityFound)}</Text>
        </Box>
      )}
      {managementFeed.data.length > 0 && (
        <Table
          bgColor={colors.white}
          innerBorders={{
            headerCells: true,
            bodyRows: true,
          }}
        >
          <Thead>
            <Tr>
              <Th
                clickable
                sortDirection={
                  sort === '-acted_at' ? 'descending' : 'ascending'
                }
                onClick={() =>
                  setSort(sort === '-acted_at' ? 'acted_at' : '-acted_at')
                }
              >
                {formatMessage(messages.date)}
              </Th>
              <Th>{formatMessage(messages.user)}</Th>
              <Th>{formatMessage(messages.item)}</Th>
              <Th>{formatMessage(messages.action)}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {/* TODO: Fix this the next time the file is edited. */}
            {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
            {managementFeed?.data.map((item) => (
              <ManagementFeedRow key={item.id} item={item} />
            ))}
          </Tbody>
          {currentPage && lastPage && lastPage > 1 && (
            <Tfoot>
              <Tr background={colors.grey50}>
                <Td colSpan={4}>
                  <Box display="flex" justifyContent="center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={lastPage}
                      loadPage={setPageNumber}
                    />
                  </Box>
                </Td>
              </Tr>
            </Tfoot>
          )}
        </Table>
      )}
    </>
  );
};

export default ManagementFeed;
