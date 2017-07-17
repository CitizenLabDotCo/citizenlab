
import React from 'react';
import PropTypes from 'prop-types';

// components
import FilterSelector from 'containers/FilterSelector';

// store
import { push } from 'react-router-redux';
import { createStructuredSelector } from 'reselect';
import { preprocess } from 'utils';

// parse search
import queryString from 'query-string';

// translations
import { injectTFunc } from 'containers/T/utils';

const SelectSort = ({ options, value, filterPage }) => (
  <FilterSelector
    title="Sort"
    name="sort"
    selected={value}
    values={options}
    onChange={filterPage}
  />
);

SelectSort.propTypes = {
  value: PropTypes.array,
  options: PropTypes.array.isRequired,
  filterPage: PropTypes.func,
};

SelectSort.defaultProps = {
  options: [],
  filterPage: () => {},
  value: [],
};

const mapStateToProps = () => createStructuredSelector({
  search: (state) => state.getIn(['route', 'locationBeforeTransitions', 'search']),
  location: (state) => state.getIn(['route', 'locationBeforeTransitions', 'pathname']),
});

const mergeQuery = (search, type, ids) => {
  const query = queryString.parse(search);
  query[type] = ids;
  return queryString.stringify(query);
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { search, location } = stateProps;

  const options = [
    { text: 'Newest', value: 'new' },
    { text: 'Oldest', value: '-new' },
    { text: 'Trending', value: 'trending' },
    { text: 'Popular', value: 'popular' },
  ];
  const { goTo } = dispatchProps;

  const value = [queryString.parse(search).sort];

  const filterPage = (name, ids) => {
    goTo(`${location}?${mergeQuery(search, name, ids)}`);
  };

  return { options, value, filterPage, ...ownProps };
};

export default injectTFunc(preprocess(mapStateToProps, { goTo: push }, mergeProps)(SelectSort));
