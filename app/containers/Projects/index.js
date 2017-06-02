/*
 *
 * ProjectsIndexPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';

// import IdeaCard from 'components/IdeaCard';
import HelmetIntl from 'components/HelmetIntl';
import messages from './messages';

class Projects extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  render() {
    const { children } = this.props;
    return (
      <div>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        {children}
      </div>
    );
  }
}

Projects.propTypes = {
  children: PropTypes.element.isRequired,
};

export default Projects;
