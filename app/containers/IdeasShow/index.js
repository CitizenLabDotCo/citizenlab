/*
 *
 * IdeasShow
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import _ from 'lodash';
import makeSelectIdeasShow from './selectors';
import messages from './messages';

export class IdeasShow extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div>
        <Helmet
          title="IdeasShow"
          meta={[
            { name: 'description', content: 'Description of IdeasShow' },
          ]}
        />
        <h1>
          <FormattedMessage {...messages.header} />
        </h1>

        <h3>{ _.startCase(this.props.params.slug) } Idea</h3>
      </div>
    );
  }
}

IdeasShow.propTypes = {
  // dispatch: PropTypes.func.isRequired,
  params: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  IdeasShow: makeSelectIdeasShow(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(IdeasShow);
