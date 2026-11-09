import React, { useState } from 'react';

import {
  Box,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Text,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useUsers from 'api/users/useUsers';

import Pagination from 'components/Pagination';
import SearchInput from 'components/UI/SearchInput';

import { useIntl } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import UsersHeader from '../../_shared/UsersHeader';
import messages from '../../messages';

import EmailBounceRow from './EmailBounceRow';

// Same header style as the registered users table
const Uppercase = styled.span`
  text-transform: uppercase;
`;

const EmailBounces = () => {
  const { formatMessage } = useIntl();
  const [search, setSearch] = useState<string | undefined>();
  const [pageNumber, setPageNumber] = useState(1);

  const { data: users } = useUsers({
    only_email_bounced: true,
    include_inactive: true,
    search,
    pageNumber,
  });

  if (!users) return null;

  const currentPage = getPageNumberFromUrl(users.links.self);
  const lastPage = getPageNumberFromUrl(users.links.last);

  return (
    <>
      <UsersHeader
        title={messages.emailBounces}
        subtitle={messages.emailBouncesDescription}
      />
      <Box width="100%" display="flex" justifyContent="flex-end">
        <SearchInput
          onChange={(value) => {
            setSearch(value ?? undefined);
            setPageNumber(1);
          }}
          a11y_numberOfSearchResults={users.data.length}
        />
      </Box>
      <Divider />
      {users.data.length > 0 ? (
        <Box mb="30px">
          <Table mt="20px">
            <Thead>
              <Tr>
                <Th>
                  <Uppercase>
                    {formatMessage(messages.emailBouncesName)}
                  </Uppercase>
                </Th>
                <Th>
                  <Uppercase>
                    {formatMessage(messages.emailBouncesStatus)}
                  </Uppercase>
                </Th>
                <Th>
                  <Uppercase>
                    {formatMessage(messages.emailBouncesBouncedAt)}
                  </Uppercase>
                </Th>
                <Th>
                  <Uppercase>
                    {formatMessage(messages.emailBouncesReason)}
                  </Uppercase>
                </Th>
                <Th style={{ textAlign: 'center' }}>
                  <Uppercase>
                    {formatMessage(messages.emailBouncesDelete)}
                  </Uppercase>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.data.map((user) => (
                <EmailBounceRow key={user.id} user={user} />
              ))}
            </Tbody>
          </Table>
          {currentPage && lastPage && lastPage > 1 && (
            <Box mt="12px">
              <Pagination
                currentPage={currentPage}
                totalPages={lastPage}
                loadPage={setPageNumber}
              />
            </Box>
          )}
        </Box>
      ) : (
        <Text>{formatMessage(messages.emailBouncesNone)}</Text>
      )}
    </>
  );
};

export default EmailBounces;
