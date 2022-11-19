import React from 'react';

// components
import { Thead, Tr, Th, Text } from '@citizenlab/cl2-component-library';

// styling
import { colors } from 'utils/styleUtils';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

// typings
import { SortAttribute } from 'resources/GetInvites';
import { SortDirection } from 'utils/paginationUtils';

interface ClickableCellProps {
  width: string;
  sortDirection: SortDirection | undefined;
  style?: React.CSSProperties;
  onClick: () => void;
  children: React.ReactNode;
}

const ClickableCell = ({
  children,
  sortDirection,
  ...otherProps
}: ClickableCellProps) => (
  <Th
    clickable
    background={sortDirection ? colors.grey200 : undefined}
    sortDirection={sortDirection}
    {...otherProps}
  >
    {children}
  </Th>
);

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
  <Thead>
    <Tr background={colors.grey50}>
      <ClickableCell
        sortDirection={sortAttribute === 'email' ? sortDirection : undefined}
        onClick={onSortHeaderClick('email')}
        width="38%"
      >
        <FormattedMessage {...messages.email} />
      </ClickableCell>
      <ClickableCell
        sortDirection={
          sortAttribute === 'last_name' ? sortDirection : undefined
        }
        onClick={onSortHeaderClick('last_name')}
        width="25%"
      >
        <FormattedMessage {...messages.name} />
      </ClickableCell>
      <ClickableCell
        sortDirection={
          sortAttribute === 'created_at' ? sortDirection : undefined
        }
        onClick={onSortHeaderClick('created_at')}
        width="13%"
      >
        <FormattedMessage {...messages.invitedSince} />
      </ClickableCell>
      <ClickableCell
        sortDirection={
          sortAttribute === 'invite_status' ? sortDirection : undefined
        }
        onClick={onSortHeaderClick('invite_status')}
        width="12%"
        style={{ textAlign: 'center' }}
      >
        <FormattedMessage {...messages.inviteStatus} />
      </ClickableCell>
      <Th
        width="12%"
        style={{ textAlign: 'center' }}
        infoTooltip={
          <Text mb="0px" mt="0px" fontSize="s">
            <FormattedMessage {...messages.deleteInviteTooltip} />
          </Text>
        }
      >
        <FormattedMessage {...messages.deleteInvite} />
      </Th>
    </Tr>
  </Thead>
);

export default TableHeader;
