import React from 'react';

// components
import { Table } from 'semantic-ui-react';
import { IconTooltip, Text } from '@citizenlab/cl2-component-library';

// styling
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
        <IconTooltip
          ml="6px"
          iconColor={colors.teal700}
          iconHoverColor="#000"
          iconSize="16px"
          theme="light"
          transform="translate(0,-1)"
          content={
            <Text mb="0px" mt="0px" fontSize="s">
              <FormattedMessage {...messages.deleteInviteTooltip} />
            </Text>
          }
        />
      </Table.HeaderCell>
    </Table.Row>
  </Table.Header>
);

export default TableHeader;
