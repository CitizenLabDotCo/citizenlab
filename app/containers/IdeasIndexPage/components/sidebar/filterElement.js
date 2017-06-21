import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { Menu } from 'semantic-ui-react';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router';
import { push } from 'react-router-redux';

import queryString from 'query-string';

import T from 'containers/T';

const FilterElement = ({ title, id, filterPage }) => (
  <Menu.Item name={id} onClick={filterPage} >
    <T value={title} />
  </Menu.Item>
);

FilterElement.propTypes = {
  id: PropTypes.string.isRequired,
  title: ImmutablePropTypes.map.isRequired,
  filterPage: PropTypes.func.isRequired,
};

const mergeQuery = ({ search }, type, id) => {
  const query = queryString.parse(search, { arrayFormat: 'index' });
  query[type] = (query[type] || []).concat(id);
  query[type] = [...new Set(query[type])];
  return queryString.stringify(query, { arrayFormat: 'index' });
};

const mapDispatchToProps = (dispatch) => bindActionCreators({ push }, dispatch);

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { element, type } = ownProps;
  const id = element.get('id');
  const title = element.getIn(['attributes', 'title_multiloc']);
  const filter = dispatchProps.push;

  const filterPage = () => {
    filter(`/ideas?${mergeQuery(ownProps.location, type, id)}`);
  };

  return { title, id, filterPage, ...ownProps };
};

export default withRouter(connect(null, mapDispatchToProps, mergeProps)(FilterElement));
