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
import { injectIntl, intlShape } from 'react-intl';

// components
import WatchSagas from 'containers/WatchSagas';
import ContentContainer from 'components/ContentContainer';
import IdeaCards from 'components/IdeaCards';
import Footer from 'components/Footer';

import SelectTopics from './components/selectTopics';
import SelectAreas from './components/selectAreas';
import SelectSort from './components/selectSort';
import SearchField from './components/searchField';

// store
import { loadTopicsRequest, loadAreasRequest, resetIdeas } from './actions';
import sagasWatchers from './sagas';
import messages from './messages';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  position: relative;
`;

const BackgroundColor = styled.div`
  position: absolute;
  top: 200px;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 0;
  background-color: #f8f8f8;
`;

const StyledContentContainer = styled(ContentContainer)`
  padding-bottom: 80px;
`;

const FiltersArea = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  height: 3.5rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  margin-bottom: 3.5rem;
  width: 100%;

  @media (min-width: 500px) {
    flex-wrap: nowrap;
  }
`;

class IdeasIndex extends React.PureComponent {

  componentWillMount() {
    this.areasTitle = this.props.intl.formatMessage(messages.areasTitle);
    this.topicsTitle = this.props.intl.formatMessage(messages.topicsTitle);
    this.sortTitle = this.props.intl.formatMessage(messages.sortTitle);
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
      <Container>

        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />

        <WatchSagas sagas={sagasWatchers} />

        <BackgroundColor />

        <StyledContentContainer>
          {withFilters && <FiltersArea id="e2e-ideas-filters">
            <SearchField />
            <SelectSort title={this.sortTitle} />
            <SelectTopics title={this.topicsTitle} />
            <SelectAreas title={this.areasTitle} />
          </FiltersArea>}
          <IdeaCards id="ideas-cards" filter={filter} />
        </StyledContentContainer>

        <Footer />

      </Container>
    );
  }
}

IdeasIndex.contextTypes = {
  sagas: PropTypes.func.isRequired,
};

IdeasIndex.propTypes = {
  loadTopicsRequest: PropTypes.func.isRequired,
  loadAreasRequest: PropTypes.func.isRequired,
  resetIdeas: PropTypes.func.isRequired,
  filter: PropTypes.object,
  withFilters: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
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

export default injectIntl(connect(null, actions, mergeProps)(IdeasIndex));
