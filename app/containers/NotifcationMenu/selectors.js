import { createSelector } from 'reselect';

/**
 * Direct selector to the notifcationMenu state domain
 */
const selectNotifcationMenuDomain = () => (state) => state.get('notifcationMenu');

/**
 * Other specific selectors
 */


/**
 * Default selector used by NotifcationMenu
 */

const makeSelectNotifcationMenu = () => createSelector(
  selectNotifcationMenuDomain(),
  (substate) => substate.toJS()
);

export default makeSelectNotifcationMenu;
export {
  selectNotifcationMenuDomain,
};
