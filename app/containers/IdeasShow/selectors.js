import { createSelector } from 'reselect';

import { selectResourcesDomain, makeSelectResourceBySlug } from 'utils/resources/selectors';

const selectIdeasShow = (...types) => (state) => state.getIn(['ideasShow', ...types]);
import { fromJS } from 'immutable';

// export const selectIdea = createSelector(
//   selectResourcesDomain('ideas'),
//   selectResourcesDomainBySlug('ideas'),
//   (_, props) => props.slug,
//   (ideas, ideaBySlug, slug) => slug && ideas && ideas.get(slug),
// );

export const selectIdea = makeSelectResourceBySlug('ideas');

export const makeSelectComments = createSelector(
  selectIdeasShow('comments'),
  selectResourcesDomain('comments'),
  (ids, comments) => (ids && arrayToTree(ids, comments)) || [],
);

export const arrayToTree = (ids, comments) => {
  const map = {};
  const roots = [];

  ids.forEach((id) => {
    const parentId = comments.get(id).getIn(['relationships', 'parent', 'data', 'id']);
    const node = { id, children: [] };
    map[id] = node;

    if (!parentId) return roots.push(node);
    if (map[parentId]) map[parentId].children.push(node);
    return '';
  });

  return roots;
};

export const selectIdeaImages = createSelector(
  selectResourcesDomain('idea_images'),
  selectIdea,
  (resourcesImages, idea) => {
    const images = idea && idea.getIn(['relationships', 'idea_images', 'data']);
    return (images
      ? images.map((imageData) => resourcesImages.get(imageData.get('id')))
      : fromJS([]));
  },
);

export default selectIdeasShow;
