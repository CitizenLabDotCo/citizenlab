/*
 *
 * UsersShowPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { createStructuredSelector } from 'reselect';
import { FormattedMessage } from 'react-intl';
import { Saga } from 'react-redux-saga';
import { push } from 'react-router-redux';

import {
  makeSelectIdeas,
  makeSelectLoadingUser, makeSelectLoadingUserIdeas, makeSelectLoadUserError, makeSelectLoadUserIdeasError,
  makeSelectUser,
} from './selectors';
import messages from './messages';
import Avatar from './Avatar';
import UserIdeas from './UserIdeas';
import { watchLoadUser, watchLoadUserIdeas } from './sagas';
import { loadUserIdeasRequest, loadUserRequest } from './actions';

export class UsersShowPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  componentDidMount() {
    // load user
    this.props.loadUser(this.props.params.slug);
    // ... and related ideas
    this.props.loadUserIdeas(this.props.params.slug);
  }

  render() {
    const { loadingUser, loadUserError, userData, loadingUserIdeas, loadUserIdeasError, ideas, goToIdea } = this.props;
    const avatarURL = (userData && userData.avatar ? userData.avatar.medium : '');

    return (
      <div>
        <Helmet
          title="UsersShowPage"
          meta={[
            { name: 'description', content: 'User Profile' },
          ]}
        />
        <Saga saga={watchLoadUser} />
        <Saga saga={watchLoadUserIdeas} />

        <Avatar avatarURL={avatarURL} />
        {userData && <div>
          {userData.first_name} {userData.last_name}
        </div>}
        {loadingUser && <FormattedMessage {...messages.loadingUser} />}
        {loadUserError && <div>{loadUserError}</div>}
        <UserIdeas
          loadingUserIdeas={loadingUserIdeas}
          loadUserIdeasError={loadUserIdeasError}
          userIdeas={ideas}
          goToIdea={goToIdea}
        />
      </div>
    );
  }
}

UsersShowPage.propTypes = {
  params: PropTypes.object,
  loadUser: PropTypes.func.isRequired,
  loadingUser: PropTypes.bool.isRequired,
  loadUserError: PropTypes.string,
  userData: PropTypes.object,
  loadUserIdeas: PropTypes.func.isRequired,
  loadingUserIdeas: PropTypes.bool.isRequired,
  loadUserIdeasError: PropTypes.bool,
  ideas: PropTypes.any.isRequired,
  goToIdea: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  loadingUser: makeSelectLoadingUser(),
  loadUserError: makeSelectLoadUserError(),
  userData: makeSelectUser(),
  loadingUserIdeas: makeSelectLoadingUserIdeas(),
  loadUserIdeasError: makeSelectLoadUserIdeasError(),
  ideas: makeSelectIdeas(),
});

export function mapDispatchToProps(dispatch) {
  return {
    loadUser(userId) {
      dispatch(loadUserRequest(userId));
    },
    loadUserIdeas(userId) {
      dispatch(loadUserIdeasRequest(userId));
    },
    goToIdea(ideaId) {
      dispatch(push(`/ideas/${ideaId}`));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersShowPage);
