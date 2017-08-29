
import { fromJS } from 'immutable';
import { UPDATE_CURRENT_USER_REQUEST, UPDATE_CURRENT_USER_SUCCESS, UPDATE_CURRENT_USER_ERROR } from './constants';


export const usersEditPageInitialState = fromJS({
  processing: false,
  errors: {},
});

export default function usersEditPageReducer(state = usersEditPageInitialState, action) {
  switch (action.type) {
    case UPDATE_CURRENT_USER_REQUEST:
      return state
        .set('processing', true);
    case UPDATE_CURRENT_USER_SUCCESS:
      return state
        .set('processing', false)
        .deleteIn(['errors', action.field]);
    case UPDATE_CURRENT_USER_ERROR:
      return state
        .set('processing', false)
        .set('errors', action.field, action.payload);
    default:
      return state;
  }
}
