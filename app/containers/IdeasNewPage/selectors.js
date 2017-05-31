import { createSelector } from 'reselect';
import { selectResourcesDomain } from 'utils/resources/selectors';

const selectSubmitIdea = (state) => state.get('submitIdea');

const makeSelectTopics = () => createSelector(
  selectSubmitIdea,
  selectResourcesDomain(),
  (submitIdeaState, resources) => {
    const ids = submitIdeaState.getIn(['topics', 'ids']);
    const topics = resources.get('topics');
    return ids.map((id) => topics.get(id));
  }
);

const makeSelectAreas = () => createSelector(
  selectSubmitIdea,
  selectResourcesDomain(),
  (submitIdeaState, resources) => {
    const ids = submitIdeaState.getIn(['areas', 'ids']);
    const areas = resources.get('areas');
    return ids.map((id) => areas.get(id));
  }
);

const makeSelectProjects = () => createSelector(
  selectSubmitIdea,
  selectResourcesDomain(),
  (submitIdeaState, resources) => {
    const ids = submitIdeaState.getIn(['projects', 'ids']);
    const projects = resources.get('projects');
    return ids.map((id) => projects.get(id));
  }
);

export {
  selectSubmitIdea,
  makeSelectTopics,
  makeSelectProjects,
  makeSelectAreas,
};
