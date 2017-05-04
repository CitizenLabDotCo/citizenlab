import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Menu } from 'semantic-ui-react';
import { createStructuredSelector } from 'reselect';
import { bindActionCreators } from 'redux';

import { selectResourcesDomain } from 'utils/resources/selectors';
import { loadNextPage } from '../../actions';

import FilterElement from './filterElement';

const Filters = ({ resource, type }) => {
  if (!resource) return null;
  return (
    <Menu.Item>
      <Menu.Header name={'topics'}>
        <div>{ type }</div>
      </Menu.Header>
      <Menu.Menu>
        {resource.reactMap((element, id) => <FilterElement key={id} id={id} element={element} type={type} />)}
      </Menu.Menu>
    </Menu.Item>
  );
};

Filters.propTypes = {
  resource: PropTypes.any,
  type: PropTypes.string.isRequired,
};

const mapDispatchToProps = (dispatch) => bindActionCreators({ loadNextPage }, dispatch);

const mapStateToProps = () => createStructuredSelector({
  resource: (state, { type }) => selectResourcesDomain(type)(state),
});

export default connect(mapStateToProps, mapDispatchToProps)(Filters);
