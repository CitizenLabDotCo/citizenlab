import { createSelector, createSelectorCreator } from 'reselect';
import { selectResourcesDomain } from 'utils/resources/selectors';
import { selectActions } from 'utils/store/selectors';

import { activeList, activeResource } from 'utils/denormalize';
import { OrderedMap, List } from 'immutable';
import _ from 'lodash'

/**
* Direct selector to the ideasIndexPage state domain
*/

const selectIdeasIndexPageDomain = (...types) => (state) => {
  let data = state.get('ideasIndexPage');
  types.map((type) => (data = data.get(type)));
  return data;
};

const makeSelectIdeasIndexPage = () => createSelector(
  selectIdeasIndexPageDomain(),
  (substate) => substate.toJS()
);

// this momoizer is to be used only when both the list of ids from the pageState and the resource need to be avalialbe in orther to trigger the render.
function readyMemoize(func) {
  let prevState = null;
  let prevGoState = List();
  let prevResources = null;
  let prevReady = false;

  return function (...args) {
    const [state, resources, storeAction] = args;
    let lastResult;
    let ready;

    if (!storeAction.toJS().slice(-1).includes('MERGE_JSONAPI_RESOURCES')){
      ready = state && !state.isEmpty()
      if (ready) {
        const isStateReady = prevState !== state;
        if (isStateReady || !prevReady) {
          const newIds = _.difference(state.toJS(), prevGoState.toJS());
          // console.group()
          // console.log(newIds)
          // console.log(state.toJS())
          // console.log(prevGoState.toJS())
          // console.groupEnd()
          prevGoState = state;
          cache.action = 'add';
          lastResult = func(newIds, resources, cache);
          delete cache.action;
        }
      }
    };

    cache.store = lastResult || cache.store;
    prevReady = ready;
    prevState = state;
    prevResources = resources;
    return cache.store;
  };
}

const readyCreateSelector = createSelectorCreator(readyMemoize);

// const ideaSelectorCache = () => {
//   const cache = { store: OrderedMap() };
//   return () => {
//     return cache
//   }
// }

const makeSelectResources = (...args) => readyCreateSelector(
  selectIdeasIndexPageDomain(...args),
  selectResourcesDomain(args[0]),
  selectActions(),
  (ids, resources, cache) => {
    cache.store = denormalizeIdeas(ids, resources, cache);
    return cache.store;
  }
);

const denormalizeIdeas = (ids, ideas, cache) => {
  let newMap = OrderedMap();
  if (cache.action === 'add') newMap = cache.store;
  ids.forEach((id) => {
    const newIdea = ideas.get(id);
    newMap = newMap.set(id, newIdea);
  });
  return newMap;
};

// this momoizer will render something only if either one of the basic resources (topics, areas and/or users are avaliable) It will still return the list of ideas as it depends on the previous momoizer.
function presentMemoize(func) {
  let prevResources = [];
  let cleanState;
  let ideas;

  // we reference arguments instead of spreading them for performance reasons
  return function (newState, ...resources) {
    if (cleanState !== newState) ideas = cleanState = newState;
    if (newState.isEmpty()) return ideas;

    ideas = ideas || newState;
    const [topics, areas, users] = resources;
    const namedResources = [['topics', topics], ['areas', areas], ['users', users]];

    const presentResources = [ideas, ...resources].filter((resource) => (
      resource && !resource.isEmpty()
    ));

    let newResourcesLength = 0;
    const newResources = namedResources.map((resource, i) => {
      if (prevResources[i] !== resource[1] && !resource[1].isEmpty()) {
        newResourcesLength += 1;
        return resource;
      }
      return null;
    });
    //console.log(ready)
    const ready = presentResources.length > 1 && newResourcesLength;
    if (ready) ideas = func(ideas, ...newResources);

    prevResources = resources;
    return ideas;
  };
}

// const presentCreateSelector = createSelectorCreator(presentMemoize);

const makeSelectIdeas = () => createSelectorCreator(presentMemoize)(
  makeSelectResources('ideas'),
  makeSelectResources('topics', 'ids'),
  makeSelectResources('areas', 'ids'),
  selectResourcesDomain('users'),
  (cache, topics, areas, author) => {
    const ideas = cache.store;
    cache.store = activeResource(ideas, { topics, areas, author });
    console.log(cache.store.toJS());
    return cache.store;
  }
);


const makeSelectNextPageNumber = () => createSelector(
  selectIdeasIndexPageDomain(),
  (pageState) => pageState.get('nextPageNumber')
);

const makeSelectNextPageItemCount = () => createSelector(
  selectIdeasIndexPageDomain(),
  (pageState) => pageState.get('nextPageItemCount')
);

const makeSelectLoading = () => createSelector(
  selectIdeasIndexPageDomain(),
  (submitIdeaState) => submitIdeaState.get('loading')
);


export default makeSelectIdeasIndexPage;

export {
  makeSelectResources,
  selectIdeasIndexPageDomain,
  makeSelectNextPageNumber,
  makeSelectLoading,
  makeSelectNextPageItemCount,
  makeSelectIdeas,
};
