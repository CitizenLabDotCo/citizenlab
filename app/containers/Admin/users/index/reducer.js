import { ACTION_PREFIX } from './constants';
import { fromJS } from 'immutable';
import { makePrefixedUsersReducer } from 'resources/users/reducer';

const initialState = fromJS({
  someLocalState: 4,
});

const prefixedUsersReducer = makePrefixedUsersReducer(ACTION_PREFIX);

function ideasIndexPageReducer(state = initialState, action) {
  switch (action.type) {
    case 'somelocalaction': {
      if (!state.getIn(['projects', 'loading'])) {
        return state.set('someLocalState', action.newLocalState);
      }
      return state;
    }
    default: {
      return state
        .set('users', prefixedUsersReducer(state.get('users'), action));
    }
  }
}

export default ideasIndexPageReducer;
