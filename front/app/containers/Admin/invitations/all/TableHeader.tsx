import React from 'react';

// components
import { Header, Row, HeaderCell } from 'components/admin/Table';
import { IconTooltip, Text } from '@citizenlab/cl2-component-library';

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
  <HeaderCell
    clickable
    background={sortDirection ? colors.grey200 : undefined}
    sortDirection={sortDirection}
    {...otherProps}
  >
    {children}
  </HeaderCell>
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
  <Header background={colors.grey50}>
    <Row>
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
      <HeaderCell width="12%" style={{ textAlign: 'center' }}>
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
      </HeaderCell>
    </Row>
  </Header>
);

export default TableHeader;
