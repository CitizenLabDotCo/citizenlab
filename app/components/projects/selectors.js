import { createSelector } from 'reselect';
import { selectResourcesDomain } from 'utils/resources/selectors';
import { fromJS } from 'immutable';

export const selectProject = createSelector(
  selectResourcesDomain('projects'),
  (_, props) => props.id,
  (projects, id) => id && projects && projects.get(id),
);

export const selectProjectImages = createSelector(
  selectResourcesDomain('project_images'),
  selectProject,
  (resourcesProjects, project) => {
    const images = project && project.getIn(['relationships', 'project_images', 'data']);
    return (images
      ? images.map((imageData) => resourcesProjects.get(imageData.get('id')))
      : fromJS([]));
  },
);
