import { createSelector } from 'reselect';
import { activeResource } from 'utils/denormalize';
import { selectResourcesDomain } from 'utils/resources/selectors';

const selectIdeasFromResources = (state) => state.getIn(['resources', 'ideas']);
const selectTopicsFromResources = (state) => state.getIn(['resources', 'topics']);
const selectAreasFromResources = (state) => state.getIn(['resources', 'areas']);
const selectIdeasIds = (state) => state.getIn(['ideasPage', 'ideas', 'ids']);
const selectIdeasLoading = (state) => state.getIn(['ideasPage', 'ideas', 'loading']);
const selectIdeasLoadError = (state) => state.getIn(['ideasPage', 'ideas', 'error']);
const selectTopicsIds = (state) => state.getIn(['ideasPage', 'topics', 'ids']);
const selectTopicsLoading = (state) => state.getIn(['ideasPage', 'topics', 'loading']);
const selectTopicsLoadError = (state) => state.getIn(['ideasPage', 'topics', 'error']);
const selectAreasIds = (state) => state.getIn(['ideasPage', 'areas', 'ids']);
const selectAreasLoading = (state) => state.getIn(['ideasPage', 'areas', 'loading']);
const selectAreasLoadError = (state) => state.getIn(['ideasPage', 'areas', 'error']);
const selectFirstPageNumber = (state) => state.getIn(['ideasPage', 'firstPageNumber']);
const selectFirstPageItemCount = (state) => state.getIn(['ideasPage', 'firstPageItemCount']);
const selectPrevPageNumber = (state) => state.getIn(['ideasPage', 'prevPageNumber']);
const selectPrevPageItemCount = (state) => state.getIn(['ideasPage', 'prevPageItemCount']);
const selectCurrentPageNumber = (state) => state.getIn(['ideasPage', 'currentPageNumber']);
const selectCurrentPageItemCount = (state) => state.getIn(['ideasPage', 'currentPageItemCount']);
const selectNextPageNumber = (state) => state.getIn(['ideasPage', 'nextPageNumber']);
const selectNextPageItemCount = (state) => state.getIn(['ideasPage', 'nextPageItemCount']);
const selectLastPageNumber = (state) => state.getIn(['ideasPage', 'lastPageNumber']);
const selectLastPageItemCount = (state) => state.getIn(['ideasPage', 'lastPageItemCount']);
const selectPageCount = (state) => state.getIn(['ideasPage', 'pageCount']);

const makeSelectLoading = () => createSelector(
  selectIdeasLoading,
  selectTopicsLoading,
  selectAreasLoading,
  (ideasLoading, topicsLoading, areasLoading) => (ideasLoading || topicsLoading || areasLoading)
);

const makeSelectLoadError = () => createSelector(
  selectIdeasLoadError,
  selectTopicsLoadError,
  selectAreasLoadError,
  (ideasLoadError, topicsLoadError, areasLoadError) => (ideasLoadError || topicsLoadError || areasLoadError)
);

const makeselectPaginatedIdeas = () => createSelector(
  selectIdeasIds,
  selectIdeasFromResources,
  selectTopicsFromResources,
  selectAreasFromResources,
  (ideasIds, ideas, topics, areas) => {

    if (ideas) {
      ideas.map((idea) => {
        // idea.relationships.topics.data[0].id
        // idea.relationships.areas.data[0].id
        // topics[id].attributes
        // areas[id].attributes

        if (idea.relationships.topics.data) {
          topics.forEach((topic) => {
            const id = topicRef.get('id');

            if (idea.relationships.topics.data.some(topicRef => id === topic.getIn([id, 'id']))) {
              const topicContent = topic.getIn(['id', 'attributes']);
              idea = idea.setIn(['topics', topicRef.get('id'), topicContent);
            }
          });
        }

        return idea;
      });
    }

    return ideasIds.map((id) => ideas.get(id));
  }
);

export {
  selectFirstPageNumber,
  selectFirstPageItemCount,
  selectPrevPageNumber,
  selectPrevPageItemCount,
  selectCurrentPageNumber,
  selectCurrentPageItemCount,
  selectNextPageNumber,
  selectNextPageItemCount,
  selectLastPageNumber,
  selectLastPageItemCount,
  selectPageCount,
  makeSelectLoading,
  makeSelectLoadError,
  makeselectPaginatedIdeas,
};
