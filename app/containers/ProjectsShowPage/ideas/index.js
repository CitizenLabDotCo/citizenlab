/*
 *
 * IdeasIndexPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import HelmetIntl from 'components/HelmetIntl';

// components
import OverlayChildren from 'utils/containers/overlayChildren';
import PageView from 'containers/IdeasIndexPage/pageView';

// store
import { preprocess } from 'utils';
import { push } from 'react-router-redux';

// messages
import messages from 'containers/IdeasIndexPage/messages';

// need to implement Helmet
class ProjectIdeasIndex extends React.Component {

  isMainView = ({ params }) => !params.ideaId

  backToMainView = () => {
    const goTo = this.props.push;
    const { params } = this.props;
    return () => goTo(`/projects/${params.slug}/ideas`);
  };

  render() {
    const { children, params } = this.props;
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
          filter={{ project: params.slug }}
          {...this.props}
        >
          {children}
        </OverlayChildren>
      </div>
    );
  }
}

ProjectIdeasIndex.propTypes = {
  children: PropTypes.element,
  push: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
};

export default preprocess(null, { push })(ProjectIdeasIndex);
