import React from 'react';
import PropTypes from 'prop-types';

import { Sidebar as LayoutSidebar, Menu } from 'semantic-ui-react';
import T from 'containers/T';
import { TopicsFilters, AreasFilters } from  './sidebar/filters';

class Sidebar extends React.Component {
  render() {
    const { toggleVisibility, visible } = this.props;
    return (
      <LayoutSidebar
        as={Menu}
        animation={'push'}
        onMouseLeave={toggleVisibility}
        width={'thin'}
        visible={visible}
        icon={'labeled'}
        vertical
        inverted
      >
        <TopicsFilters type={'topics'} title={'topics'} />
        <AreasFilters type={'areas'} title={'areas'} />
      </LayoutSidebar>
    );
  }
}

Sidebar.propTypes = {
  toggleVisibility: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
};

export default Sidebar;
