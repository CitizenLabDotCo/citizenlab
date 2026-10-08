import React, { useState } from 'react';

import {
  Box,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import useUsers from 'api/users/useUsers';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Pagination from 'components/Pagination';
import SearchInput from 'components/UI/SearchInput';

import { useIntl } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import UsersHeader from '../../_shared/UsersHeader';
import messages from '../../messages';

import EmailBounceRow from './EmailBounceRow';

const EmailBounces = () => {
  const { formatMessage } = useIntl();
  const [search, setSearch] = useState<string | undefined>();
  const [pageNumber, setPageNumber] = useState(1);
  const isCustomSmtpEnabled = useFeatureFlag({ name: 'custom_smtp' });

  const { data: users } = useUsers({
    only_email_bounced: true,
    include_inactive: true,
    search,
    pageNumber,
  });

  if (isCustomSmtpEnabled || !users) return null;

  const currentPage = getPageNumberFromUrl(users.links.self);
  const lastPage = getPageNumberFromUrl(users.links.last);

  return (
    <>
      <UsersHeader
        title={messages.emailBounces}
        subtitle={messages.emailBouncesSubtitle}
      />
      <Box p="20px">
        <Box mb="24px">
          <SearchInput
            onChange={(value) => setSearch(value ?? undefined)}
            a11y_numberOfSearchResults={users.data.length}
          />
        </Box>
        {users.data.length > 0 ? (
          <Table
            border={`1px solid ${colors.grey300}`}
            borderRadius={stylingConsts.borderRadius}
            innerBorders={{ headerCells: true, bodyRows: true }}
          >
            <Thead>
              <Tr background={colors.grey50}>
                <Th>{formatMessage(messages.emailBouncesName)}</Th>
                <Th>{formatMessage(messages.emailBouncesEmail)}</Th>
                <Th>{formatMessage(messages.emailBouncesBouncedAt)}</Th>
                <Th>{formatMessage(messages.emailBouncesReason)}</Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody>
              {users.data.map((user) => (
                <EmailBounceRow key={user.id} user={user} />
              ))}
            </Tbody>
            {currentPage && lastPage && lastPage > 1 && (
              <Tfoot>
                <Tr background={colors.grey50}>
                  <Td colSpan={5}>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={lastPage}
                      loadPage={setPageNumber}
                    />
                  </Td>
                </Tr>
              </Tfoot>
            )}
          </Table>
        ) : (
          <Text>{formatMessage(messages.emailBouncesNone)}</Text>
        )}
      </Box>
    </>
  );
};

export default EmailBounces;
