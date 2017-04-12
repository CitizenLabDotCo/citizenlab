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

import { makeSelectLoadError, makeSelectLoading, makeSelectUserData } from './selectors';
import { loadUser } from './actions';
import messages from './messages';
import Avatar from './Avatar';

export class UsersShowPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  componentDidMount() {
    // load user
    this.props.loadUser(this.props.params.slug);
  }

  render() {
    const { loading, loadError, userData } = this.props;
    const avatarURL = (userData && userData.avatar ? userData.avatar.medium : '');

    return (
      <div>
        <Helmet
          title="UsersShowPage"
          meta={[
            { name: 'description', content: 'User Profile' },
          ]}
        />
        <Avatar avatarURL={avatarURL} />
        {userData && <div>
          {userData.first_name} {userData.last_name}
        </div>}
        {loading && <FormattedMessage {...messages.loading} />}
        {loadError && <div>{loadError}</div>}
      </div>
    );
  }
}

UsersShowPage.propTypes = {
  params: PropTypes.object,
  loadUser: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  loadError: PropTypes.bool,
  userData: PropTypes.object.isRequired,
};

const mapStateToProps = createStructuredSelector({
  loading: makeSelectLoading(),
  loadError: makeSelectLoadError(),
  userData: makeSelectUserData(),
});

function mapDispatchToProps(dispatch) {
  return {
    loadUser(userId) {
      dispatch(loadUser(userId));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersShowPage);
