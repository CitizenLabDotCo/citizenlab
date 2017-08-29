import { createSelector } from 'reselect';
import { fromJS } from 'immutable';
import { selectResourcesDomain } from 'utils/resources/selectors';

const selectProject = (__, props) => props.project;

const makeSelectTopics = () => createSelector(
  selectProject,
  selectResourcesDomain(),
  (project, resources) => {
    const ids = project.getIn(['relationships', 'topics', 'data']);
    const topics = resources.get('topics');
    return topics && ids && ids.map((id) => topics.get(id));
  }
);

const selectProjectImages = createSelector(
  selectResourcesDomain('project_images'),
  selectProject,
  (resourcesImages, project) => {
    const images = project && project.getIn(['relationships', 'project_images', 'data']);
    return (images
      ? images.map((imageData) => resourcesImages.get(imageData.get('id')))
      : fromJS([]));
  },
);

export {
  makeSelectTopics,
  selectProjectImages,
};
