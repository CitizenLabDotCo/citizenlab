import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Sidebar, Menu } from 'semantic-ui-react';
import T from 'containers/T';
import { createStructuredSelector } from 'reselect';

import { makeSelectResources } from '../selectors';


class SideMenuFilter extends React.Component {
  render() {
    let { resource } = this.props;
    const { onCLick, title } = this.props;
    resource = resource.toArray();
    return (
      <Menu.Item>
        <Menu.Header name={'topics'}>
          { title }
        </Menu.Header>
        <Menu.Menu>
          {resource.map((element) => {
            const title = element.getIn(['attributes', 'title_multiloc']).toJS();
            return (
              <Menu.Item key={element.get('id')} onClick={onCLick} >
                <T key={element.id} value={title} />
              </Menu.Item>
            );
          })}
        </Menu.Menu>
      </Menu.Item>
    );
  }
}

SideMenuFilter.propTypes = {
  resource: PropTypes.any.isRequired,
  title: PropTypes.string.isRequired,
  onCLick: PropTypes.func.isRequired,
};


class SidebarMenuContainer extends React.Component {
  render() {
    const { toggleVisibility, visible, topics, areas } = this.props;
    return (
      <Sidebar as={Menu} animation={'push'} onMouseLeave={toggleVisibility} width={'thin'} visible={visible} icon={'labeled'} vertical inverted>
        <SideMenuFilter onCLick={() => console.log('clicked')} resource={topics} title={'topics'} />
        <SideMenuFilter onCLick={() => console.log('clicked')} resource={areas} title={'Areas'} />
      </Sidebar>
    )
  }
}

SidebarMenuContainer.propTypes = {
  toggleVisibility: PropTypes.func.isRequired,
  topics: PropTypes.any.isRequired,
  areas: PropTypes.any.isRequired,
  visible: PropTypes.bool.isRequired,
};

const mapStateToProps = createStructuredSelector({
  topics: makeSelectResources('topics', 'ids'),
  areas: makeSelectResources('areas', 'ids'),
});

export default connect(mapStateToProps)(SidebarMenuContainer);
