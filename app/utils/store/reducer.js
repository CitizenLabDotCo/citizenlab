import { Map, fromJS } from 'immutable';
import { SET_GO_BACK_TO_CODE, DELETE_GO_BACK_TO_CODE } from './constants';

function utilsReducer(state = Map(), action) {
  switch (action.type) {
    case SET_GO_BACK_TO_CODE:
      return state.set('code', action.code);
    case DELETE_GO_BACK_TO_CODE:
      return state.remove('code');
    default:
      return state;
  }
}

// listens for all actions and according to the affix (REQUEST, ERROR || SUCCESS, will save the state of the request.)
// Already connected to the main state
const toDefaultType = (type) => {
  const actionArray = type.split('_');
  actionArray.pop();
  actionArray.push('REQUEST');
  return actionArray.join('_');
};

function tempStateReducer(state = Map(), action) {
  const actionKind = action.type.split('_').slice(-1)[0];
  const cleanSlateArray = action.type.split('#');

  if (cleanSlateArray[1]) {
    return state.remove(action.uid);
  }

  const actionUId = action.uid || toDefaultType(action.type);

  if (actionKind === 'REQUEST') {
    return state.set(actionUId, fromJS({ loading: true, errors: {} }));
  }

  if (actionKind === 'ERROR') {
    const newState = { loading: false, error: true, errors: action.errors };
    return state.set(actionUId, fromJS(newState));
  }

  if (actionKind === 'SUCCESS') {
    return state.delete(actionUId);
  }

  return state;
}

/*
  Usefull to add local tempState behavior to your local reducer.
  It saves the hussle of need to pass the reducer and the list of contants we should filter on You can pass both a string or an array.
  This method is insensitive to the last affix. so you don't need to specify all constants (request, error & success) for a specify type of action; but only one will suffice.
*/
const withTemState = (reducer, filter = []) => (state, action) => {
  let newState = state;
  if (filter.some((ele) => toDefaultType(ele).toDefaultType(action.type))) {
    newState = tempStateReducer(state, action);
  }
  return reducer(newState, action);
};

export { utilsReducer, tempStateReducer, withTemState };
