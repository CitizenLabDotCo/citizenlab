import React, { useState } from 'react';

// components
import { Table, Popup } from 'semantic-ui-react';
import { FormattedMessage } from 'utils/cl-intl';
import Pagination from 'components/admin/Pagination';
import Button from 'components/UI/Button';
import { Icon } from '@citizenlab/cl2-component-library';
import Row from './Row';
import SearchInput from 'components/UI/SearchInput';

// resources
import GetInvites, {
  GetInvitesChildProps,
  SortAttribute,
} from 'resources/GetInvites';

// i18n
import messages from '../messages';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// utils
import { API_PATH } from 'containers/App/constants';
import { requestBlob } from 'utils/request';
import { isNilOrError } from 'utils/helperUtils';
import { isEmpty } from 'lodash-es';
import { saveAs } from 'file-saver';

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

const InfoIcon = styled(Icon)`
  fill: ${colors.teal700};
  width: 16px;
  height: 16px;
  cursor: pointer;

  &:hover {
    fill: #000;
  }
`;

const InvitesTable = ({
  invitesList,
  sortAttribute,
  sortDirection,
  currentPage,
  lastPage,
  onChangeSorting,
  onChangePage,
  onChangeSearchTerm,
}: GetInvitesChildProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [exporting, setExporting] = useState(false);

  if (isNilOrError(invitesList)) return null;

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
    onChangeSorting(sortAttribute);
  };

  const handleChangeSearchTerm = (searchValue: string) => {
    setSearchValue(searchValue);
    onChangeSearchTerm(searchValue);
  };

  return (
    <Container>
      <HeaderContainer>
        <SearchInput
          onChange={handleChangeSearchTerm}
          a11y_numberOfSearchResults={invitesList.length}
        />
        <Button
          buttonStyle="cl-blue"
          icon="download"
          onClick={handleInvitesExport}
          processing={exporting}
        >
          <FormattedMessage {...messages.exportInvites} />
        </Button>
      </HeaderContainer>

      {invitesList.length > 0 && (
        <Table sortable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell
                sorted={sortAttribute === 'email' ? sortDirection : undefined}
                onClick={handleSortHeaderClick('email')}
                width={3}
              >
                <FormattedMessage {...messages.email} />
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={
                  sortAttribute === 'last_name' ? sortDirection : undefined
                }
                onClick={handleSortHeaderClick('last_name')}
                width={2}
              >
                <FormattedMessage {...messages.name} />
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={
                  sortAttribute === 'created_at' ? sortDirection : undefined
                }
                onClick={handleSortHeaderClick('created_at')}
                width={1}
              >
                <FormattedMessage {...messages.invitedSince} />
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={
                  sortAttribute === 'invite_status' ? sortDirection : undefined
                }
                onClick={handleSortHeaderClick('invite_status')}
                width={1}
                textAlign="center"
              >
                <FormattedMessage {...messages.inviteStatus} />
              </Table.HeaderCell>
              <Table.HeaderCell width={1} textAlign="center">
                <FormattedMessage {...messages.deleteInvite} />
                <Popup
                  content={
                    <FormattedMessage {...messages.deleteInviteTooltip} />
                  }
                  trigger={
                    <button>
                      <InfoIcon name="info3" />
                    </button>
                  }
                />
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {invitesList.map((invite) => (
              <Row key={invite.id} invite={invite} />
            ))}
          </Table.Body>

          {currentPage && lastPage && lastPage > 1 && (
            <Table.Footer fullWidth={true}>
              <Table.Row>
                <Table.HeaderCell colSpan="6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={lastPage}
                    loadPage={onChangePage}
                  />
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          )}
        </Table>
      )}

      {isEmpty(invitesList) && !isEmpty(searchValue) && (
        <EmptyStateContainer>
          <FormattedMessage {...messages.currentlyNoInvitesThatMatchSearch} />
        </EmptyStateContainer>
      )}
    </Container>
  );
};

export default () => (
  <GetInvites>{(invites) => <InvitesTable {...invites} />}</GetInvites>
);
