import { createSelector } from 'reselect';
import { selectResourcesDomain } from 'utils/resources/selectors';

const selectProjectEvents = (state) => state.get('projectEvents');

const makeSelectEvents = () => createSelector(
  selectProjectEvents,
  selectResourcesDomain(),
  (projectEventsState, resources) => {
    const ids = projectEventsState.get('events');
    const events = resources.get('events');
    return events && ids.map((id) => events.get(id));
  }
);

export {
  makeSelectEvents,
};
