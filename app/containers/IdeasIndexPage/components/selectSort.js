
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
import { injectTFunc } from 'components/T/utils';
import { injectIntl } from 'react-intl';
import messages from '../messages';

const SelectSort = ({ options, value, filterPage, title }) => (
  <FilterSelector
    title={title}
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
  title: PropTypes.string,
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
    { text: ownProps.intl.formatMessage(messages.trending), value: 'trending' },
    { text: ownProps.intl.formatMessage(messages.popular), value: 'popular' },
    { text: ownProps.intl.formatMessage(messages.newest), value: 'new' },
    { text: ownProps.intl.formatMessage(messages.oldest), value: '-new' },
  ];
  const { goTo } = dispatchProps;

  const sortParam = queryString.parse(search).sort;
  const value = [];
  if (sortParam) value.push(sortParam);

  const filterPage = (name, ids) => {
    goTo(`${location}?${mergeQuery(search, name, ids)}`);
  };

  return { options, value, filterPage, ...ownProps };
};

export default injectIntl(injectTFunc(preprocess(mapStateToProps, { goTo: push }, mergeProps)(SelectSort)));
