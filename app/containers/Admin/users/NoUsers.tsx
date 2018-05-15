import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router';

import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import Icon from 'components/UI/Icon';

const NoUsersPage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 21px;
  color: #044D6C;
  font-weight: bold;
  line-height: 25px;
  padding-top: 50px;
  svg {
    margin-bottom: 20px;
  }
`;

const SFormattedMessage = styled.div`
  color: #84939E;
  font-weight: 400;
  font-size: 16px;
  a {
    color: #84939E;
    font-weight: bold;
    text-decoration: underline;
  }
`;

interface Props {
  type: 'normal' | 'smart';
}

export default class NoUsers extends React.PureComponent<Props> {
  render() {
    return (
      <NoUsersPage>
        <Icon name="blankPage" />
        <FormattedMessage {...messages.emptyGroup} />
        {this.props.type === 'normal' &&
          <SFormattedMessage>
            <FormattedMessage
              {...messages.goToAllUsers}
              values={{
                allUsersLink: (
                  <Link to="/users/">
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
