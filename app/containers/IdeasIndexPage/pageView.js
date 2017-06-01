/*
 *
 * IdeasIndexPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';

// components
import WatchSagas from 'containers/WatchSagas';
import { Segment, Grid } from 'semantic-ui-react';
import IdeaCards from './components/ideaCards';

// store
import { preprocess } from 'utils';
import { filterIdeas, loadIdeasRequest, loadTopicsRequest, loadAreasRequest, resetIdeas } from './actions';
import sagasWatchers from './sagas';

const topBar = () => (
    <Grid columns={2}>
      <Grid.Row>
        {/* TOPICS */}
        <Grid.Column width={5} textAlign="center">
          {<MultiSelectT
            options={topicsSelect}
            maxSelectionLength={3}
            placeholder={formatMessage({ ...messages.topicsPlaceholder })}
            optionLabel={formatMessage({ ...messages.topicsLabel })}
            handleOptionsAdded={this.storeTopics}
          />}
        </Grid.Column>
        {/* AREAS */}
        <Grid.Column width={5} textAlign="center">
          <MultiSelectT
            options={areasSelect}
            maxSelectionLength={3}
            placeholder={formatMessage({ ...messages.areasPlaceholder })}
            optionLabel={formatMessage({ ...messages.areasLabel })}
            handleOptionsAdded={this.storeAreas}
          />
        </Grid.Column>
        <Grid.Column width={5} textAlign="center">
          <MultiSelectT
            options={projectsSelect}
            maxSelectionLength={1}
            singleSelection
            placeholder={formatMessage({ ...messages.projectsPlaceholder })}
            optionLabel={formatMessage({ ...messages.projectsLabel })}
            handleOptionsAdded={this.storeProject}
          />}
        </Grid.Column>
      </Grid.Row>
    </Grid>
)

class View extends React.Component {
  constructor(props) {
    super();
    const { location } = props;
    this.search = location.search;
    this.state = { visible: false };
  }

  componentDidMount() {
    this.props.loadTopicsRequest();
    this.props.loadAreasRequest();
  }

  /* Component should update if new query params are provided */
  componentWillReceiveProps(nextProps) {
    const newSearch = nextProps.location.search;
    const isNewSearch = newSearch !== this.search;
    this.search = newSearch;
    if (isNewSearch) this.getideas(nextProps);
  }

  shouldComponentUpdate(props, { visible }) {
    const current = this.state.visible;
    return current !== visible;
  }

  componentWillUnmount() {
    this.props.resetIdeas();
  }

  getideas = (location, query) => {
    const data = location || this.props;
    const search = data.location.search;
    if (search) {
      this.props.filterIdeas(search, query);
    } else {
      this.props.loadIdeasRequest(true, null, null, null, query);
    }
  }

  toggleVisibility = () => this.setState({ visible: !this.state.visible })

  render() {
    const { filter } = this.props;
    return (
      <div>
        <WatchSagas sagas={sagasWatchers} />
        <Segment style={{ width: 1000, marginLeft: 'auto', marginRight: 'auto' }} basic>

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
