import { createSelector } from 'reselect';
import { fromJS } from 'immutable';

const immutableEmptyArray = fromJS([]);
const selectAreas = (state) => state.getIn(['resources', 'areas']);
const selectAreasIds = (state) => state.getIn(['areas', 'areasIds']);

const makeSelectAreas = () => createSelector(
  selectAreasIds,
  selectAreas,
  (areasIds, areas) => {
    if (areas && areasIds) {
      return areasIds.map((id) => areas.get(id));
    }

    return immutableEmptyArray;
  }
);

export {
  makeSelectAreas,
};
