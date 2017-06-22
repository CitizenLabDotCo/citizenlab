
import React from 'react';
import PropTypes from 'prop-types';

// components
import MultiSelect from 'components/forms/inputs/multiSelect';

// store
import { push } from 'react-router-redux';
import { selectResourcesDomain } from 'utils/resources/selectors';
import { createStructuredSelector } from 'reselect';
import { preprocess } from 'utils';

// parse search
import queryString from 'query-string';

// translations
import { injectTFunc } from 'containers/T/utils';

const SelectArea = ({ options, value, filterPage }) => (
  <div style={{ display: 'inline-block', width: '33%', marginRight: '10px' }}>
    <MultiSelect
      name={'areas'}
      options={options}
      action={filterPage}
      value={value}
    />
  </div>
);

SelectArea.propTypes = {
  value: PropTypes.array,
  options: PropTypes.array.isRequired,
  filterPage: PropTypes.func,
};

SelectArea.defaultProps = {
  options: [],
  filterPage: () => {},
  value: [],
};

const mapStateToProps = () => createStructuredSelector({
  areas: (state) => selectResourcesDomain('areas')(state),
  search: (state) => state.getIn(['route', 'locationBeforeTransitions', 'search']),
  location: (state) => state.getIn(['route', 'locationBeforeTransitions', 'pathname']),
});

const mergeQuery = (search, type, ids) => {
  const query = queryString.parse(search, { arrayFormat: 'index' });
  query[type] = ids;
  return queryString.stringify(query, { arrayFormat: 'index' });
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { areas, search, location } = stateProps;
  if (!areas) return {};

  const { tFunc } = ownProps;

  const options = areas.reactMap((element) => {
    const value = element.get('id');
    const text = tFunc(element.getIn(['attributes', 'title_multiloc']));
    return { text, value };
  });
  const { goTo } = dispatchProps;

  const value = queryString.parse(search, { arrayFormat: 'index' }).areas;

  const filterPage = (name, ids) => {
    goTo(`${location}?${mergeQuery(search, name, ids)}`);
  };

  return { options, value, filterPage, ...ownProps };
};

export default injectTFunc(preprocess(mapStateToProps, { goTo: push }, mergeProps)(SelectArea));
