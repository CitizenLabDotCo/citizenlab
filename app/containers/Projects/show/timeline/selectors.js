import { createSelector } from 'reselect';
import { selectResourcesDomain } from 'utils/resources/selectors';

const selectProjectTimeline = (state) => state.get('projectTimeline');

const makeSelectPhases = () => createSelector(
  selectProjectTimeline,
  selectResourcesDomain(),
  (projectTimelineState, resources) => {
    const ids = projectTimelineState.get('phases');
    const phases = resources.get('phases');
    return phases && ids.map((id) => phases.get(id));
  }
);

export {
  makeSelectPhases,
};
