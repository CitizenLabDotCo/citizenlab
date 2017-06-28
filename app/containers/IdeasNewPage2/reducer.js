import { fromJS } from 'immutable';
import { LOAD_TOPICS_SUCCESS, LOAD_PROJECTS_SUCCESS, SUBMIT_IDEA_SUCCESS } from './constants';

const initialState = fromJS({
  topics: [],
  projects: [],
  ideaId: null,
});

function IdeasNewPage2Reducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_TOPICS_SUCCESS: {
      const topics = action.payload.topics.data.map((topic) => topic.id);
      return state.set('topics', fromJS(topics));
    }
    case LOAD_PROJECTS_SUCCESS: {
      const projects = action.payload.projects.data.map((project) => project.id);
      return state.set('projects', fromJS(projects));
    }
    case SUBMIT_IDEA_SUCCESS: {
      const ideaId = action.payload.ideaId;
      return state.set('ideaId', ideaId);
    }
    default:
      return state;
  }
}

export default IdeasNewPage2Reducer;
