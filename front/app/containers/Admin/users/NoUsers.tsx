import React, { memo } from 'react';
import styled from 'styled-components';
import Link from 'utils/cl-router/Link';

import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { Icon } from '@citizenlab/cl2-component-library';
import { colors, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';
import { MembershipType } from 'api/groups/types';

const NoUsersPage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: ${fontSizes.xl}px;
  font-weight: bold;
  line-height: 25px;
  padding-top: 80px;
  svg {
    margin-bottom: 20px;
    height: 70px;
    fill: ${colors.teal400};
  }
`;

const SFormattedMessage = styled.div`
  color: ${colors.textSecondary};
  font-weight: 400;
  font-size: ${fontSizes.base}px;

  a {
    color: ${colors.textSecondary};
    font-weight: bold;
    text-decoration: underline;

    &:hover {
      color: ${darken(0.2, colors.textSecondary)};
    }
  }
`;

interface Props {
  groupType?: MembershipType;
  noSuchSearchResult?: boolean;
}

const NoUsers = memo(({ groupType, noSuchSearchResult }: Props) => {
  if (noSuchSearchResult) {
    return (
      <NoUsersPage>
        <Icon name="search" width="45px" height="45px" />
        <FormattedMessage {...messages.noUserMatchesYourSearch} />
      </NoUsersPage>
    );
  }

  return (
    <NoUsersPage>
      <Icon name="sidebar-pages-menu" />
      <FormattedMessage {...messages.emptyGroup} />
      {groupType === 'manual' && (
        <SFormattedMessage>
          <FormattedMessage
            {...messages.goToAllUsers}
            values={{
              allUsersLink: (
                <Link to="/admin/users/">
                  <FormattedMessage {...messages.allUsers} />
                </Link>
              ),
            }}
          />
        </SFormattedMessage>
      )}
    </NoUsersPage>
  );
});

export default NoUsers;
