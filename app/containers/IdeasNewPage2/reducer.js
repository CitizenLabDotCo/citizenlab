import { fromJS } from 'immutable';
import { LOAD_TOPICS_SUCCESS, LOAD_AREAS_SUCCESS, LOAD_PROJECTS_SUCCESS } from './constants';

const initialState = fromJS({
  topics: [],
  areas: [],
  projects: [],
});

function IdeasNewPage2Reducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_TOPICS_SUCCESS: {
      const topics = action.payload.topics.data.map((topic) => topic.id);
      return state.set('topics', fromJS(topics));
    }
    case LOAD_AREAS_SUCCESS: {
      const areas = action.payload.areas.data.map((area) => area.id);
      return state.set('areas', fromJS(areas));
    }
    case LOAD_PROJECTS_SUCCESS: {
      const projects = action.payload.projects.data.map((project) => project.id);
      return state.set('projects', fromJS(projects));
    }
    default:
      return state;
  }
}

export default IdeasNewPage2Reducer;
