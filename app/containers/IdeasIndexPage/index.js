/*
 *
 * IdeasIndexPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { push } from 'react-router-redux';

import OverlayChildren from 'utils/containers/overlayChildren';

import PageView from './PageView';

// Ideas show does not use helmet at this view is controlled by RouterIndexShow
class IdeasIndex extends React.Component {

  isMainView = ({ params }) => !params.slug;
  backToMainView = () => this.props.push('/ideas');

  render() {
    const { children } = this.props;
    return (
      <div>
        <Helmet
          title="Ideas index page"
          meta={[
            { name: 'description', content: 'List of ideas on the platform' },
          ]}
        />
        <OverlayChildren
          component={PageView}
          isMainView={this.isMainView}
          handleClose={this.backToMainView}
          {...this.props}
        >
          {children}
        </OverlayChildren>
      </div>
    );
  }
}

IdeasIndex.contextTypes = {
  sagas: PropTypes.func.isRequired,
};

IdeasIndex.propTypes = {
  children: PropTypes.element,
  push: PropTypes.func.isRequired,
};

const actions = { push };

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch);

export default connect(null, mapDispatchToProps)(IdeasIndex);
