import { List } from 'immutable';

/**
 * Store all the actions so that the selctors can filter them!
 */
function actionsReducer(state = List(), action) {
  return state.push(action.type)
}

export default actionsReducer