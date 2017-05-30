import { fromJS } from 'immutable';
import {
  LOAD_IDEAS_REQUEST, LOAD_IDEAS_SUCCESS, LOAD_IDEAS_ERROR,
  LOAD_PROJECTS_REQUEST, LOAD_PROJECTS_SUCCESS, LOAD_PROJECTS_ERROR,
} from './constants';

const initialState = fromJS({
  ideas: [],
  projects: [],
  loadingIdeas: false,
  loadIdeasError: false,
  loadingProjects: false,
  loadProjectsError: false,
});

function LandingPageReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_IDEAS_REQUEST:
      return state
        .set('loadingIdeas', true)
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
    case LOAD_PROJECTS_REQUEST:
      return state
        .set('loadingProjects', true)
        .set('loadProjectsError', false);
    case LOAD_PROJECTS_SUCCESS: {
      const projects = action.payload.projects.data.map((project) => project.id);
      return state
        .set('projects', fromJS(projects))
        .set('loadingProjects', false)
        .set('loadProjectsError', false);
    }
    case LOAD_PROJECTS_ERROR:
      return state
        .set('loadingProjects', false)
        .set('loadProjectsError', true);
    default:
      return state;
  }
}

export default LandingPageReducer;
