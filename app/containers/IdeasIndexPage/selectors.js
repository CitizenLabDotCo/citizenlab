import { createSelector, createSelectorCreator } from 'reselect';
import { selectResourcesDomain } from 'utils/resources/selectors';
import { activeList, activeResource } from 'utils/denormalize';
import { OrderedMap } from 'immutable';

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

function readyMemoize(func) {
  let prevPageState = null;
  let prevResources = null;
  let prevReady = false;
  let previousResult = OrderedMap();

  // we reference arguments instead of spreading them for performance reasons
  return function (...args) {
    const [pageState, resources] = args;
    let lastResult;
    const ready = pageState && resources && !pageState.isEmpty() && !resources.isEmpty();

    if (ready) {
      const newState = prevPageState !== pageState && prevResources !== resources;
      if (newState || !prevReady) {
        lastResult = func(...args);
      }
    }

    previousResult = lastResult || previousResult;
    prevReady = ready;
    prevPageState = pageState;
    prevResources = resources;
    return previousResult;
  };
}

const readyCreateSelector = createSelectorCreator(readyMemoize);

const makeSelectResources = (...args) => readyCreateSelector(
  selectIdeasIndexPageDomain(...args),
  selectResourcesDomain(args[0]),
  (resourceState, resources) => activeList(resourceState, resources)
);


function presentMemoize(func) {
  let prevResources = [];
  let cleanState;
  let state;

  // we reference arguments instead of spreading them for performance reasons
  return function (newState, ...resources) {
    if (cleanState !== newState) state = cleanState = newState;
    if (newState.isEmpty()) return state;

    state = state || newState;
    const [topics, areas, users] = resources;
    const namedResources = [['topics', topics], ['areas', areas], ['users', users]];

    const presentResources = [state, ...resources].filter((resource) => (
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

    const ready = presentResources.length > 1 && newResourcesLength;
    if (ready) state = func(state, ...newResources);

    prevResources = resources;
    return state;
  };
}

// const presentCreateSelector = createSelectorCreator(presentMemoize);

const makeSelectIdeas = () => createSelectorCreator(presentMemoize)(
  makeSelectResources('ideas'),
  makeSelectResources('topics', 'ids'),
  makeSelectResources('areas', 'ids'),
  selectResourcesDomain('users'),
  (state, topics, areas, author) => (
    activeResource(state, { topics, areas, author })
  )
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
