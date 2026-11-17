import React, { useState } from 'react';

import {
  Table,
  Tbody,
  Tfoot,
  Tr,
  Td,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { saveAs } from 'file-saver';
import { isEmpty } from 'lodash-es';
import styled from 'styled-components';

import { Sort, SortAttribute } from 'api/invites/types';
import useInvites from 'api/invites/useInvites';

import { API_PATH } from 'containers/App/constants';

import Pagination from 'components/Pagination';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import SearchInput from 'components/UI/SearchInput';

import { FormattedMessage } from 'utils/cl-intl';
import {
  getPageNumberFromUrl,
  getSortAttribute,
  getSortDirection,
} from 'utils/paginationUtils';
import { requestBlob } from 'utils/requestBlob';

import messages from '../messages';

import TableHeader from './TableHeader';
import TableRow from './TableRow';

const Container = styled.div`
  th::after {
    margin-top: -7px !important;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  margin: 0;
  margin-bottom: 30px;

  .no-padding-right button {
    padding-right: 0;
  }
`;

const EmptyStateContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const InvitesTable = () => {
  const [searchValue, setSearchValue] = useState('');
  const [exporting, setExporting] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [sort, setSort] = useState<Sort>('-created_at');

  const { data: invites } = useInvites({
    sort,
    pageNumber,
    search: searchValue,
  });

  if (!invites) return null;

  const currentPage = getPageNumberFromUrl(invites.links.self);
  const lastPage = getPageNumberFromUrl(invites.links.last);

  const handleInvitesExport = async () => {
    try {
      setExporting(true);

      const blob = await requestBlob(
        `${API_PATH}/invites/as_xlsx`,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );

      saveAs(blob, 'invites-export.xlsx');

      setExporting(false);
    } catch (error) {
      setExporting(false);
    }
  };

  const handleSortHeaderClick = (sortAttribute: SortAttribute) => () => {
    const oldSortAttribute = getSortAttribute<Sort, SortAttribute>(sort);
    const oldSortDirection = getSortDirection<Sort>(sort);
    const newSortDirection =
      sortAttribute === oldSortAttribute && oldSortDirection === 'descending'
        ? 'ascending'
        : 'descending';
    const newSortDirectionSymbol = newSortDirection === 'descending' ? '-' : '';
    const newSort = `${newSortDirectionSymbol}${sortAttribute}` as const;
    setSort(newSort);
  };

  const handleChangeSearchTerm = (searchValue: string) => {
    setSearchValue(searchValue);
  };

  const sortAttribute = getSortAttribute<Sort, SortAttribute>(sort);
  const sortDirection = getSortDirection<Sort>(sort);

  return (
    <Container>
      <HeaderContainer>
        <SearchInput
          onChange={handleChangeSearchTerm}
          a11y_numberOfSearchResults={invites.data.length}
        />
        <ButtonWithLink
          buttonStyle="admin-dark"
          icon="download"
          onClick={handleInvitesExport}
          processing={exporting}
        >
          <FormattedMessage {...messages.exportInvites} />
        </ButtonWithLink>
      </HeaderContainer>

      {invites.data.length > 0 && (
        <Table
          border={`1px solid ${colors.grey300}`}
          borderRadius={stylingConsts.borderRadius}
          innerBorders={{
            headerCells: true,
            bodyRows: true,
          }}
        >
          <TableHeader
            sortAttribute={sortAttribute}
            sortDirection={sortDirection}
            onSortHeaderClick={handleSortHeaderClick}
          />

          <Tbody>
            {invites.data.map((invite) => (
              <TableRow key={invite.id} invite={invite} />
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
      )}

      {isEmpty(invites.data) && !isEmpty(searchValue) && (
        <EmptyStateContainer>
          <FormattedMessage {...messages.currentlyNoInvitesThatMatchSearch} />
        </EmptyStateContainer>
      )}
    </Container>
  );
};

export default InvitesTable;
