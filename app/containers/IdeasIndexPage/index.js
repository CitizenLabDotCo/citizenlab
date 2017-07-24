/*
 *
 * IdeasIndexPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import HelmetIntl from 'components/HelmetIntl';
import { connect } from 'react-redux';

import { push } from 'react-router-redux';

import OverlayChildren from 'utils/containers/overlayChildren';

import PageView from './pageView';

import messages from './messages';

// need to implement Helmet
class IdeasIndex extends React.Component {

  isMainView = ({ params }) => !params.ideaId;

  backToMainView = () => {
    const goTo = this.props.push;
    return () => goTo('/ideas');
  };

  render() {
    const { children } = this.props;
    return (
      <div>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
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
  params: PropTypes.object.isRequired,
};

const mapDispatchToProps = { push };

export default connect(null, mapDispatchToProps)(IdeasIndex);
