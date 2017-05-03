import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Menu } from 'semantic-ui-react';
import { createStructuredSelector } from 'reselect';
import { bindActionCreators } from 'redux';

import T from 'containers/T';
import { selectResourcesDomain } from 'utils/resources/selectors';
import { loadNextPage } from '../../actions';

import FilterElement from './filterElement';

class Filters extends React.Component {
  render() {
    const { resource } = this.props;
    if (!resource) return null;

    const { title } = this.props;
    return (
      <Menu.Item>
        <Menu.Header name={'topics'}>
          <div>{ title }</div>
        </Menu.Header>
        <Menu.Menu>
          {resource.reduce((out, element, id) => (
            out.concat(<FilterElement key={id} id={id} element={element} />)
          ), [])}
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

const mapStateToProps = (type) => createStructuredSelector({
  resource: selectResourcesDomain(type),
});

export const TopicsFilters = connect(mapStateToProps('topics'), mapDispatchToProps)(Filters);
export const AreasFilters = connect(mapStateToProps('areas'), mapDispatchToProps)(Filters);
