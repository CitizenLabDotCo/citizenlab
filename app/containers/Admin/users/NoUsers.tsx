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
  }
  border-top: 2px solid ${colors.separation};
`;

const SFormattedMessage = styled.div`
  color: ${colors.adminGreyText};
  font-weight: 400;
  font-size: 16px;
  a {
    color: ${colors.adminGreyText};
    font-weight: bold;
    text-decoration: underline;
  }
`;

interface Props {
  smartGroup?: boolean;
}

export default class NoUsers extends React.PureComponent<Props> {
  render() {
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
