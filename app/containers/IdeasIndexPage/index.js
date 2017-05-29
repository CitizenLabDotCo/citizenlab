/*
 *
 * IdeasIndexPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { push } from 'react-router-redux';

import OverlayChildren from 'utils/containers/overlayChildren';

import PageView from './pageView';

// need to implement Helmet
class IdeasIndex extends React.Component {

  isMainView = ({ params }) => !params.ideaId

  backToMainView = () => {
    const goTo = this.props.push;
    const { params } = this.props;
    return () => goTo(`/projects/${params.slug}/ideas`);
  };

  render() {
    const { children } = this.props;
    return (
      <div>
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
  params: PropTypes.object.isRequired,
};

const actions = { push };

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch);

export default connect(null, mapDispatchToProps)(IdeasIndex);
