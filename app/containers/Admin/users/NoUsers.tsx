import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router';

import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import Icon from 'components/UI/Icon';
import { colors } from 'utils/styleUtils';

const NoUsersPage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 21px;
  font-weight: bold;
  line-height: 25px;
  padding-top: 80px;
  svg {
    margin-bottom: 20px;
    height: 70px;
    fill: ${colors.clIconAccent}
  }
`;

const SFormattedMessage = styled.div`
  color: ${colors.adminSecondaryTextColor};
  font-weight: 400;
  font-size: 16px;
  a {
    color: ${colors.adminSecondaryTextColor};
    font-weight: bold;
    text-decoration: underline;
  }
`;

interface Props {
  smartGroup?: boolean;
  noSuchSearchResult?: boolean;
}

export default class NoUsers extends React.PureComponent<Props> {
  render() {
    if (this.props.noSuchSearchResult) {
      return (
        <NoUsersPage>
          <Icon name="search" />
          <FormattedMessage {...messages.noUserMatchesYourSearch} />
        </NoUsersPage>
      );
    }
    return (
      <NoUsersPage>
        <Icon name="blankPage" />
        <FormattedMessage {...messages.emptyGroup} />
        {!this.props.smartGroup &&
          <SFormattedMessage>
            <FormattedMessage
              {...messages.goToAllUsers}
              values={{
                allUsersLink: (
                  <Link to="/admin/users/">
                    <FormattedMessage {...messages.allUsers} />
                  </Link>),
              }}
            />
          </SFormattedMessage>
        }
      </NoUsersPage>
    );
  }
}
