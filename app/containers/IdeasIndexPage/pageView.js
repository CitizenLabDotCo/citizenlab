/*
 *
 * IdeasIndexPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';

// components
import WatchSagas from 'containers/WatchSagas';
import { Segment } from 'semantic-ui-react';
import IdeaCards from './components/ideaCards';
import MultiSelect from 'components/forms/inputs/multiSelect';

// store
import { push } from 'react-router-redux'
import { selectResourcesDomain } from 'utils/resources/selectors';
import { createStructuredSelector } from 'reselect';
import { preprocess } from 'utils';
import { filterIdeas, loadIdeasRequest, loadTopicsRequest, loadAreasRequest, resetIdeas } from './actions';
import sagasWatchers from './sagas';

// parse search
import queryString from 'query-string';

// translations
import { injectTFunc } from 'containers/T/utils';


const selectTopic = ({ options, value, filterPage }) => (
  <div>
    <MultiSelect
      name={'topics'}
      options={options}
      action={filterPage}
      value={value}
    />
  </div>
);

selectTopic.propTypes = {
  value: PropTypes.array,
  options: PropTypes.array.isRequired,
  filterPage: PropTypes.func,
};

selectTopic.defaultProps = {
  options: [],
  filterPage: () => {},
  value: [],
};

const mapStateToProps = () => createStructuredSelector({
  topics: (state) => selectResourcesDomain('topics')(state),
  search: (state) => state.getIn(['route', 'locationBeforeTransitions', 'search']),
});

const mergeQuery = (search, type, ids) => {
  const query = queryString.parse(search, { arrayFormat: 'index' });
  query[type] = ids;
  return queryString.stringify(query, { arrayFormat: 'index' });
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { topics, search } = stateProps;
  if (!topics) return {};

  const { tFunc } = ownProps;

  const options = topics.reactMap((element) => {
    const value = element.get('id');
    const text = tFunc(element.getIn(['attributes', 'title_multiloc']));
    return { text, value };
  });
  const { goTo } = dispatchProps;

  const value = queryString.parse(search, { arrayFormat: 'index' }).topics;

  const filterPage = (name, ids) => {
    goTo(`/ideas?${mergeQuery(search, name, ids)}`);
  };

  return { options, value, filterPage, ...ownProps };
};

const SelectTopic = injectTFunc(preprocess(mapStateToProps, { goTo: push }, mergeProps)(selectTopic));

class View extends React.Component {
  constructor(props) {
    super();
    const { location } = props;
    this.search = location.search;
  }

  componentDidMount() {
    this.props.loadTopicsRequest();
    this.props.loadAreasRequest();
  }

  componentWillUnmount() {
    this.props.resetIdeas();
  }

  render() {
    const { filter } = this.props;
    return (
      <div>
        <WatchSagas sagas={sagasWatchers} />
        <Segment style={{ width: 1000, marginLeft: 'auto', marginRight: 'auto' }} basic>
        <SelectTopic />
          <IdeaCards filter={filter} />
        </Segment>
      </div>
    );
  }
}

View.contextTypes = {
  sagas: PropTypes.func.isRequired,
};

View.propTypes = {
  loadTopicsRequest: PropTypes.func.isRequired,
  loadAreasRequest: PropTypes.func.isRequired,
  location: PropTypes.object,
  filterIdeas: PropTypes.func.isRequired,
  loadIdeasRequest: PropTypes.func.isRequired,
  resetIdeas: PropTypes.func.isRequired,
  filter: PropTypes.object,
};

View.defaultProps = {
  location: {},
};

const actions = { filterIdeas, loadIdeasRequest, loadTopicsRequest, loadAreasRequest, resetIdeas };

export default preprocess(null, actions)(View);
