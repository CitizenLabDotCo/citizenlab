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

import SelectTopic from './components/selectTopics';
import SelectArea from './components/selectAreas';


// store
import { preprocess } from 'utils';
import { filterIdeas, loadIdeasRequest, loadTopicsRequest, loadAreasRequest, resetIdeas } from './actions';
import sagasWatchers from './sagas';

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
    const { filter, withFilters } = this.props;
    return (
      <div>
        <WatchSagas sagas={sagasWatchers} />
        <Segment style={{ width: 1000, marginLeft: 'auto', marginRight: 'auto' }} basic>
          {withFilters && <SelectArea />}
          {withFilters && <SelectTopic />}
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
  withFilters: PropTypes.bool.isRequired,
};

View.defaultProps = {
  location: {},
  withFilters: true,
};

const actions = { filterIdeas, loadIdeasRequest, loadTopicsRequest, loadAreasRequest, resetIdeas };

export default preprocess(null, actions)(View);
