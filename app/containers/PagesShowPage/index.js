/*
 *
 * PagesShowPage
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { Saga } from 'react-redux-saga';
import { createStructuredSelector } from 'reselect';
import makeSelectPagesShowPage from './selectors';
import defaultSaga from './sagas';
import messages from './messages';

export class PagesShowPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div>
        <Helmet
          title="PagesShowPage"
          meta={[
            { name: 'description', content: 'Description of PagesShowPage' },
          ]}
        />
        <Saga saga={defaultSaga} />
        <FormattedMessage {...messages.header} />
      </div>
    );
  }
}

PagesShowPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  PagesShowPage: makeSelectPagesShowPage(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PagesShowPage);
