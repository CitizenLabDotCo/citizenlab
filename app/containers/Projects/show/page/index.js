import React from 'react';
import PropTypes from 'prop-types';
import PagesShowPage from 'containers/PagesShowPage';

class ProjectsPage extends React.PureComponent {
  render() {
    const { routeParams } = this.props;

    return (<PagesShowPage
      params={{
        id: routeParams.pageId,
      }}
    />);
  }
}


ProjectsPage.propTypes = {
  routeParams: PropTypes.object.isRequired,
};

export default ProjectsPage;
