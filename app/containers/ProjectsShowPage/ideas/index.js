/*
 *
 * IdeasIndexPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import HelmetIntl from 'components/HelmetIntl';

// components
import IdeaCards from 'components/IdeaCards';

// messages
import messages from 'containers/IdeasIndexPage/messages';

// need to implement Helmet
class ProjectIdeasIndex extends React.Component {

  render() {
    const { params } = this.props;
    return (
      <div>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        <IdeaCards filter={{ project: params.slug }} />
      </div>
    );
  }
}

ProjectIdeasIndex.propTypes = {
  params: PropTypes.object.isRequired,
};

export default ProjectIdeasIndex;
