import { fromJS } from 'immutable';
import { SET_GO_BACK_TO_CODE, DELETE_GO_BACK_TO_CODE, } from './constants';

const initialState = fromJS({
});

/*eslint-disable*/
function actionsReducer(state = initialState, action) {
  switch (action.type) {
    case SET_GO_BACK_TO_CODE:
      return state.set('code', action.code);
    case DELETE_GO_BACK_TO_CODE:
      return state.remove('code');
    default:
      return state;
  }
}

export default actionsReducer;
