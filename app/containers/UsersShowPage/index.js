/*
 *
 * UsersShowPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import HelmetIntl from 'components/HelmetIntl';
import { createStructuredSelector } from 'reselect';
import { FormattedMessage } from 'react-intl';
import { Saga } from 'react-redux-saga';
import { Container } from 'semantic-ui-react';

import {
  makeSelectUser,
} from './selectors';
import messages from './messages';
import Avatar from './Avatar';
import UserIdeas from './UserIdeas';
import { watchLoadUser, watchLoadUserIdeas } from './sagas';
import { loadUserIdeasRequest, loadUserRequest } from './actions';
import { LOAD_USER_REQUEST } from './constants';
import T from 'containers/T';

export class UsersShowPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  componentDidMount() {
    // load user
    this.props.loadUser(this.props.params.slug);
    // ... and related ideas
    this.props.loadUserIdeas(this.props.params.slug);
  }

  render() {
    const { loadingUser, loadUserError, user } = this.props;
    const avatarURL = (user && user.avatar ? user.avatar.medium : '');

    return (
      <div>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        <Saga saga={watchLoadUser} />
        <Saga saga={watchLoadUserIdeas} />
        <Container
          fluid
          textAlign="center"
        >
          {/* AVATAR */}
          <Avatar avatarURL={avatarURL} />
          {/* USER INFORMATION */}
          {user && <div>
            <div>{user.first_name}&nbsp;{user.last_name}</div>
            {user.bio_multiloc && <T value={user.bio_mutiloc} />}
          </div>}
          {/* USER IDEAS */}
          {user && <UserIdeas />}
          {/* STATUS MESSAGES */}
          {loadingUser && <FormattedMessage {...messages.loadingUser} />}
          {loadUserError && <FormattedMessage {...messages.loadUserError} />}
        </Container>
      </div>
    );
  }
}

UsersShowPage.propTypes = {
  params: PropTypes.object,
  loadUser: PropTypes.func.isRequired,
  loadingUser: PropTypes.bool,
  loadUserError: PropTypes.bool,
  user: PropTypes.object,
  loadUserIdeas: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  loadingUser: (state) => state.getIn(['tempState', LOAD_USER_REQUEST, 'loading']),
  loadUserError: (state) => state.getIn(['tempState', LOAD_USER_REQUEST, 'error']),
  user: makeSelectUser(),
});

export function mapDispatchToProps(dispatch) {
  return {
    loadUser(userId) {
      dispatch(loadUserRequest(userId));
    },
    loadUserIdeas(userId) {
      dispatch(loadUserIdeasRequest(userId));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersShowPage);
