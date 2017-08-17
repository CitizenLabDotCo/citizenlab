import { createSelector } from 'reselect';
import { selectResourcesDomain } from 'utils/resources/selectors';

const selectProjectContainer = (state) => state.get('projectContainer');

const makeSelectProjectPages = () => createSelector(
  selectProjectContainer,
  selectResourcesDomain(),
  (projectContainer, resources) => {
    const ids = projectContainer.get('pages');
    const pages = resources.get('pages');
    return pages && ids.map((id) => pages.get(id));
  }
);

export {
  makeSelectProjectPages,
};
