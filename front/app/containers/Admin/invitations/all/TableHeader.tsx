import React from 'react';

// components
import { Header, Row, HeaderCell } from 'components/admin/Table';
import { IconTooltip, Text, Icon } from '@citizenlab/cl2-component-library';

// styling
import { colors } from 'utils/styleUtils';
import { SEMANTIC_UI_HEADER_BG_COLOR_DARKER } from 'components/admin/Table/constants';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

// typings
import { SortAttribute } from 'resources/GetInvites';
import { SortDirection } from 'utils/paginationUtils';

interface ClickableCellProps {
  width: string;
  sorted: SortDirection | undefined;
  style?: React.CSSProperties;
  onClick: () => void;
  children: React.ReactNode;
}

const ClickableCell = ({
  children,
  sorted,
  ...otherProps
}: ClickableCellProps) => (
  <HeaderCell
    clickable
    background={sorted ? SEMANTIC_UI_HEADER_BG_COLOR_DARKER : undefined}
    {...otherProps}
  >
    {children}
    {sorted && (
      <Icon
        name={sorted === 'ascending' ? 'chevron-up' : 'chevron-down'}
        width="10px"
        fill={colors.primary}
        ml="8px"
        transform="translate(0,-1)"
      />
    )}
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
  <Header>
    <Row>
      <ClickableCell
        sorted={sortAttribute === 'email' ? sortDirection : undefined}
        onClick={onSortHeaderClick('email')}
        width="38%"
      >
        <FormattedMessage {...messages.email} />
      </ClickableCell>
      <ClickableCell
        sorted={sortAttribute === 'last_name' ? sortDirection : undefined}
        onClick={onSortHeaderClick('last_name')}
        width="25%"
      >
        <FormattedMessage {...messages.name} />
      </ClickableCell>
      <ClickableCell
        sorted={sortAttribute === 'created_at' ? sortDirection : undefined}
        onClick={onSortHeaderClick('created_at')}
        width="13%"
      >
        <FormattedMessage {...messages.invitedSince} />
      </ClickableCell>
      <ClickableCell
        sorted={sortAttribute === 'invite_status' ? sortDirection : undefined}
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
