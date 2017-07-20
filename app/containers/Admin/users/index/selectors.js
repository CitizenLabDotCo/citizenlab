import { createSelector } from 'reselect';


export const selectDomain = (state) => state.get('adminUsersIndex');

export const makeSelectSearchTerm = () => createSelector(
  selectDomain,
  (state) => state.get('searchTerm'),
);
