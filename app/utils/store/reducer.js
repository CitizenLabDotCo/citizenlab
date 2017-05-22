import { Map, fromJS } from 'immutable';
import { SET_GO_BACK_TO_CODE, DELETE_GO_BACK_TO_CODE, } from './constants';

/*eslint-disable*/
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

const toErrorType = (type) => {
  const actionArray = type.split('_')
  actionArray[actionArray.length - 1] = 'ERROR'
  return actionArray.join('_')
}

function errorsReducer(state=Map(), action) {
  const actionKind = action.type.split('_').slice(-1)[0]
  const cleanSlateArray = action.type.split('#')
  if (cleanSlateArray[1]) {
    return state.remove(cleanSlateArray[0])
  }
  if (actionKind === 'ERROR') {
    return state.setIn([action.type], fromJS(action.payload || 'invalid'))
  }
  if (actionKind === 'SUCCESS') {
    return state.remove(toErrorType(action.type))
  }
  return state
}

export { utilsReducer, errorsReducer };
