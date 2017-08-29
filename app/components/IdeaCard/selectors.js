
import { createSelector } from 'reselect';
import { selectResourcesDomain } from 'utils/resources/selectors';
import { fromJS } from 'immutable';

export const selectIdea = createSelector(
  selectResourcesDomain('ideas'),
  (_, props) => props.id,
  (ideas, id) => id && ideas && ideas.get(id),
);

export const selectAuthor = createSelector(
  selectResourcesDomain('users'),
  selectIdea,
  (resourcesUsers, idea) => {
    const authorId = idea && idea.getIn(['relationships', 'author', 'data', 'id']);
    return authorId && resourcesUsers && resourcesUsers.get(authorId);
  }
);

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
