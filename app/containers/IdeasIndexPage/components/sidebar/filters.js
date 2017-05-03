import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Menu } from 'semantic-ui-react';
import { createStructuredSelector } from 'reselect';

import T from 'containers/T';
import { selectResourcesDomain } from 'utils/resources/selectors';


class Filters extends React.PureComponent {
  handleCLick = () => {
    console.log('asdf')
  }

  render() {
    let { resource } = this.props;
    const { title, type } = this.props;
    if (!resource) return null;

    resource = resource.toArray();
    return (
      <Menu.Item>
        <Menu.Header name={'topics'}>
          <div>{ title }</div>
        </Menu.Header>
        <Menu.Menu>
          {resource.map((element) => {
            const description = element.getIn(['attributes', 'title_multiloc']).toJS();
            const id = element.get('id');
            return (
              <Menu.Item key={id} onClick={this.handleCLick} >
                <T value={description} />
              </Menu.Item>
            );
          })}
        </Menu.Menu>
      </Menu.Item>
    );
  }
}

Filters.propTypes = {
  resource: PropTypes.any,
  type: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

const mapDispatchToProps = (dispatch) => bindActionCreators({ loadNextPage }, dispatch);

export default connect(null, mapDispatchToProps)(Sidebar);


const mapStateToProps = (type) => createStructuredSelector({ resource: selectResourcesDomain(type) });
//
export const TopicsFilters = connect(mapStateToProps('topics'), mapDispatchToProps)(Filters);
export const AreasFilters = connect(mapStateToProps('areas'), mapDispatchToProps)(Filters);
