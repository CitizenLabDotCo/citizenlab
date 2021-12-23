// libraries
import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { isEmpty } from 'lodash-es';
import { saveAs } from 'file-saver';

// components
import { Table, Input, Popup } from 'semantic-ui-react';
import { FormattedMessage } from 'utils/cl-intl';
import Pagination from 'components/admin/Pagination';
import Button from 'components/UI/Button';
import { Icon } from '@citizenlab/cl2-component-library';
import Row from './Row';

// resources
import GetInvites, {
  GetInvitesChildProps,
  SortAttribute,
} from 'resources/GetInvites';

// utils
import { API_PATH } from 'containers/App/constants';
import { requestBlob } from 'utils/request';

// i18n
import messages from '../messages';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

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
  fill: ${colors.clBlueDarker};
  width: 16px;
  height: 16px;
  cursor: pointer;

  &:hover {
    fill: #000;
  }
`;

export interface InputProps {}

interface Props extends InputProps, GetInvitesChildProps {}

interface State {
  searchValue: string;
  exporting: boolean;
}

class InvitesTable extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      searchValue: '',
      exporting: false,
    };
  }

  handleInvitesExport = async () => {
    try {
      this.setState({ exporting: true });
      const blob = await requestBlob(
        `${API_PATH}/invites/as_xlsx`,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      saveAs(blob, 'invites-export.xlsx');
      this.setState({ exporting: false });
    } catch (error) {
      this.setState({ exporting: false });
    }
  };

  handleSortHeaderClick = (sortAttribute: SortAttribute) => () => {
    this.props.onChangeSorting(sortAttribute);
  };

  handleChangeSearchTerm = (event) => {
    const searchValue = event.target.value;
    this.setState({ searchValue });
    this.props.onChangeSearchTerm(searchValue);
  };

  render() {
    const { searchValue, exporting } = this.state;
    const {
      invitesList,
      sortAttribute,
      sortDirection,
      currentPage,
      lastPage,
      onChangePage,
    } = this.props;

    if (!isNilOrError(invitesList)) {
      return (
        <Container className={this.props['className']}>
          <HeaderContainer>
            <Input
              icon="search"
              onChange={this.handleChangeSearchTerm}
              size="large"
            />

            <Button
              buttonStyle="cl-blue"
              icon="download"
              onClick={this.handleInvitesExport}
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
                    sorted={
                      sortAttribute === 'email' ? sortDirection : undefined
                    }
                    onClick={this.handleSortHeaderClick('email')}
                    width={3}
                  >
                    <FormattedMessage {...messages.email} />
                  </Table.HeaderCell>
                  <Table.HeaderCell
                    sorted={
                      sortAttribute === 'last_name' ? sortDirection : undefined
                    }
                    onClick={this.handleSortHeaderClick('last_name')}
                    width={2}
                  >
                    <FormattedMessage {...messages.name} />
                  </Table.HeaderCell>
                  <Table.HeaderCell
                    sorted={
                      sortAttribute === 'created_at' ? sortDirection : undefined
                    }
                    onClick={this.handleSortHeaderClick('created_at')}
                    width={1}
                  >
                    <FormattedMessage {...messages.invitedSince} />
                  </Table.HeaderCell>
                  <Table.HeaderCell
                    sorted={
                      sortAttribute === 'invite_status'
                        ? sortDirection
                        : undefined
                    }
                    onClick={this.handleSortHeaderClick('invite_status')}
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
              <FormattedMessage
                {...messages.currentlyNoInvitesThatMatchSearch}
              />
            </EmptyStateContainer>
          )}
        </Container>
      );
    }

    return null;
  }
}

export default (inputProps: InputProps) => (
  <GetInvites>
    {(invites) => <InvitesTable {...inputProps} {...invites} />}
  </GetInvites>
);
