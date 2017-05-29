import { fromJS } from 'immutable';
import {
  LOAD_IDEAS_REQUEST, LOAD_IDEAS_SUCCESS, LOAD_IDEAS_ERROR,
} from './constants';

const initialState = fromJS({
  ideas: [],
  loadingIdeas: false,
  loadIdeasError: false,
});

function LandingPageReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_IDEAS_REQUEST:
      return state
        .set('loadingIdeas', action.initialLoad)
        .set('loadIdeasError', false);
    case LOAD_IDEAS_SUCCESS: {
      const ideas = action.payload.ideas.data.map((idea) => idea.id);
      return state
        .set('ideas', fromJS(ideas))
        .set('loadingIdeas', false)
        .set('loadIdeasError', false);
    }
    case LOAD_IDEAS_ERROR:
      return state
        .set('loadingIdeas', false)
        .set('loadIdeasError', true);
    default:
      return state;
  }
}

export default LandingPageReducer;
