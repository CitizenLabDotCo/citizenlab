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
import makeSelectUsersShowPage from './selectors';

export class UsersShowPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div>
        <Helmet
          title="UsersShowPage"
          meta={[
            { name: 'description', content: 'User Profile' },
          ]}
        />
        {this.props.params.slug}
      </div>
    );
  }
}

UsersShowPage.propTypes = {
  params: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  UsersShowPage: makeSelectUsersShowPage(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersShowPage);
