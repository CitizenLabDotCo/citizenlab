/*
 *
 * UsersNewPage
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import makeSelectUsersNewPage from './selectors';
import messages from './messages';

export class UsersNewPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div>
        <Helmet
          title="UsersNewPage"
          meta={[
            { name: 'description', content: 'Description of UsersNewPage' },
          ]}
        />
        <FormattedMessage {...messages.header} />
      </div>
    );
  }
}

UsersNewPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  UsersNewPage: makeSelectUsersNewPage(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersNewPage);
