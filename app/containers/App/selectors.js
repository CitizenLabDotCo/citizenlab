// reselect
import { createSelector } from 'reselect';

const makeSelectLocationState = () => createSelector(
  (state) => state.get('route'),
  (route) => route.toJS()
);

const makeSelectLocation = () => createSelector(
  (state) => state.get('route'),
  (route) => route
);

export {
  makeSelectLocationState,
  makeSelectLocation,
};
