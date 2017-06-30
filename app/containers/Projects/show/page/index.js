import React from 'react';
import PropTypes from 'prop-types';
import PagesShowPage from 'containers/PagesShowPage';

class ProjectsPage extends React.PureComponent {
  render() {
    const { routeParams } = this.props;

    // pass key to force re-rendering as the component will always be remounted
    return (<PagesShowPage
      key={routeParams.pageId}
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
