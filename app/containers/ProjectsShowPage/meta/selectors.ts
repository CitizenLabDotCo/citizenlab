import { makeSelectResourceById, selectResourcesDomain } from 'utils/resources/selectors';
import { fromJS } from 'immutable';
import { createSelector } from 'reselect';

export const selectProject = makeSelectResourceById('projects', 'projectId');

export const selectProjectImages = createSelector(
  selectResourcesDomain('project_images'),
  selectProject,
  (resourcesImages, project) => {
    const images = project && project.getIn(['relationships', 'project_images', 'data']);
    return (images
      ? images.map((imageData) => resourcesImages.get(imageData.get('id')))
      : fromJS([]));
  },
);

