import React from 'react';

// components
import { Table, Popup } from 'semantic-ui-react';
import { Icon } from '@citizenlab/cl2-component-library';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

// typings
import { SortAttribute } from 'resources/GetInvites';
import { SortDirection } from 'utils/paginationUtils';

interface Props {
  sortAttribute: SortAttribute;
  sortDirection: SortDirection;
  onSortHeaderClick: (sortAttribute: SortAttribute) => () => void;
}

const InfoIcon = styled(Icon)`
  fill: ${colors.teal700};
  width: 16px;
  height: 16px;
  cursor: pointer;

  &:hover {
    fill: #000;
  }
`;

const TableHeader = ({
  sortAttribute,
  sortDirection,
  onSortHeaderClick,
}: Props) => (
  <Table.Header>
    <Table.Row>
      <Table.HeaderCell
        sorted={sortAttribute === 'email' ? sortDirection : undefined}
        onClick={onSortHeaderClick('email')}
        width={3}
      >
        <FormattedMessage {...messages.email} />
      </Table.HeaderCell>
      <Table.HeaderCell
        sorted={sortAttribute === 'last_name' ? sortDirection : undefined}
        onClick={onSortHeaderClick('last_name')}
        width={2}
      >
        <FormattedMessage {...messages.name} />
      </Table.HeaderCell>
      <Table.HeaderCell
        sorted={sortAttribute === 'created_at' ? sortDirection : undefined}
        onClick={onSortHeaderClick('created_at')}
        width={1}
      >
        <FormattedMessage {...messages.invitedSince} />
      </Table.HeaderCell>
      <Table.HeaderCell
        sorted={sortAttribute === 'invite_status' ? sortDirection : undefined}
        onClick={onSortHeaderClick('invite_status')}
        width={1}
        textAlign="center"
      >
        <FormattedMessage {...messages.inviteStatus} />
      </Table.HeaderCell>
      <Table.HeaderCell width={1} textAlign="center">
        <FormattedMessage {...messages.deleteInvite} />
        <Popup
          content={<FormattedMessage {...messages.deleteInviteTooltip} />}
          trigger={
            <button>
              <InfoIcon name="info3" />
            </button>
          }
        />
      </Table.HeaderCell>
    </Table.Row>
  </Table.Header>
);

export default TableHeader;
