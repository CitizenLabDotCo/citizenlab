/**
 * Direct selector to the ideasShow state domain
 */
import { selectResourcesDomain } from 'utils/resources/selectors';
import { createSelector } from 'reselect';


const selectIdeasShow = (...types) => (state) => state.getIn(['ideasShow', ...types]);
export default selectIdeasShow;

export const selectIdea = createSelector(
  selectIdeasShow('idea'),
  selectResourcesDomain('ideas'),
  (id, ideas) => id && ideas.get(id),
);

const makeSelectComments = createSelector(
  selectIdeasShow('comments'),
  selectResourcesDomain('comments'),
  (ids, comments) => (ids && activeTree(ids, comments)) || [],
);

const activeTree = (ids, comments) => {
  const map = {};
  const roots = [];

  ids.forEach((id) => {
    //if (!comments.get(id)) debugger
    const parentId = comments.get(id).getIn(['relationships', 'parent', 'data', 'id']);
    const node = { id, children: [] };
    map[id] = node;

    if (!parentId) return roots.push(node);
    return map[parentId].children.push(node);
  });

  return roots;
};


export { makeSelectComments };

    // if (parentId && !tempParentId) {
    //   return tot.unshift(id);
    // }

    // if (parentId && tempParentId === parentId) {
    //   return tot.unshift(id);
    // }

    // if (parentId && tempParentId !== parentId && id === tempParentId) {
    //   const newTot = List();
    //   return newTot.unshift([id, tot]);
    // }

    // if (parentId) {
    //   tempParentId = parentId;
    // }

    // if (!parentId) {
    //   tempParentId = null;
    //   finalList.unshift([id, tot]);
    //   return List();
    // }

    // return output || tot;
