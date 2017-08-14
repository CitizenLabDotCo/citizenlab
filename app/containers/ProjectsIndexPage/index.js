/*
 *
 * ProjectsIndexPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';

// components
import InfiniteScroll from 'react-infinite-scroller';
// import IdeaCard from 'components/IdeaCard';
import HelmetIntl from 'components/HelmetIntl';
import { FormattedMessage } from 'react-intl';
import WatchSagas from 'utils/containers/watchSagas';
import ProjectCard from 'components/ProjectCard';
import { Segment } from 'semantic-ui-react';

// store
import { preprocess } from 'utils';
import { createStructuredSelector } from 'reselect';
import { loadProjectsRequest, resetProjects } from 'resources/projects/actions';
import sagaWatchers from 'resources/projects/sagas';

// style
import { media } from 'utils/styleUtils';
import styled from 'styled-components';
import messages from './messages';

const InfiniteScrollStyled = styled(InfiniteScroll)`
  font-size: 20px;
  color: #999;
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  margin-top: 10px !important;
  ${media.tablet`
    flex-wrap: wrap;
  `}

  ${media.phone`
    flex-direction: column;
  `}
`;

export class ProjectsList extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  componentWillUnmount() {
    this.props.reset();
  }

  render() {
    const { className, loadMoreIdeas, hasMore, list } = this.props;
    return (
      <div className={className}>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        <WatchSagas sagas={sagaWatchers} />
        <Segment style={{ width: 1000, marginLeft: 'auto', marginRight: 'auto' }} basic>

          <h1>
            <FormattedMessage {...messages.header} />
          </h1>

          <InfiniteScrollStyled
            element={'div'}
            loadMore={loadMoreIdeas}
            className={'ui stackable cards'}
            initialLoad
            hasMore={hasMore}
            loader={<div className="loader"></div>}
          >
            {list.map((id) => (
              <ProjectCard key={id} id={id} />
            ))}
          </InfiniteScrollStyled>
        </Segment>
      </div>
    );
  }
}

ProjectsList.propTypes = {
  list: PropTypes.any,
  className: PropTypes.string,
  hasMore: PropTypes.bool,
  loadMoreIdeas: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
};


const mapStateToProps = createStructuredSelector({
  list: (state) => state.getIn(['projectRes', 'loaded']),
  nextPageNumber: (state) => state.getIn(['projectRes', 'nextPageNumber']),
  nextPageItemCount: (state) => state.getIn(['projectRes', 'nextPageItemCount']),
});

const mergeProps = (state, dispatch) => {
  const { list, nextPageNumber, nextPageItemCount } = state;
  const { load, reset } = dispatch;
  return {
    loadMoreIdeas: () => load(nextPageNumber, nextPageItemCount),
    hasMore: !!(nextPageNumber && nextPageItemCount),
    list,
    reset,
  };
};


export default preprocess(mapStateToProps, { load: loadProjectsRequest, reset: resetProjects }, mergeProps)(ProjectsList);
