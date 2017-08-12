/*
 *
 * IdeasIndexPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import qs from 'qs';
import HelmetIntl from 'components/HelmetIntl';
import { connect } from 'react-redux';

// components
import WatchSagas from 'containers/WatchSagas';
import IdeaCards from 'components/IdeaCards';

import SelectTopics from './components/selectTopics';
import SelectAreas from './components/selectAreas';
import SelectSort from './components/selectSort';
import SearchField from './components/searchField';

// store
import { loadTopicsRequest, loadAreasRequest, resetIdeas } from './actions';
import sagasWatchers from './sagas';
import messages from './messages';


const FiltersArea = styled.div`
  align-items: center;
  display: flex;
  height: 3.5rem;
  justify-content: flex-end;
  margin-bottom: 4.5rem;
  width: 100%;
`;

const ContentContainer = styled.section`
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  padding: 0 10px;
`;


class IdeasIndex extends React.Component {

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
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        <WatchSagas sagas={sagasWatchers} />
        <ContentContainer>
          {withFilters && <FiltersArea>
            <SearchField />
            <SelectSort />
            <SelectTopics />
            <SelectAreas />
          </FiltersArea>}
          <IdeaCards filter={filter} />
        </ContentContainer>

      </div>
    );
  }
}


IdeasIndex.contextTypes = {
  sagas: PropTypes.func.isRequired,
};

IdeasIndex.propTypes = {
  loadTopicsRequest: PropTypes.func.isRequired,
  loadAreasRequest: PropTypes.func.isRequired,
  location: PropTypes.object,
  resetIdeas: PropTypes.func.isRequired,
  filter: PropTypes.object,
  withFilters: PropTypes.bool.isRequired,
};

IdeasIndex.defaultProps = {
  location: {},
  withFilters: true,
};

const actions = { loadTopicsRequest, loadAreasRequest, resetIdeas };

const mergeProps = (_, dispatch, own) => {
  const { location } = own;
  // We use qs instead of the already available react-router parsed version,
  // because it handles the arrays nicely
  const parsedParams = qs.parse(location.search, { ignoreQueryPrefix: true });
  return { ...dispatch, ...own, filter: parsedParams };
};

export default connect(null, actions, mergeProps)(IdeasIndex);
