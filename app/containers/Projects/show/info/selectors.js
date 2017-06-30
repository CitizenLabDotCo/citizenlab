import { createSelector } from 'reselect';
import { selectResourcesDomain } from 'utils/resources/selectors';

const selectProjectInfo = (state) => state.get('projectInfo');

const makeSelectTopics = () => createSelector(
  selectProjectInfo,
  selectResourcesDomain(),
  (projectInfo, resources) => {
    const ids = projectInfo.get('topics');
    const topics = resources.get('topics');
    return topics && ids.map((id) => topics.get(id));
  }
);

export {
  makeSelectTopics,
};
