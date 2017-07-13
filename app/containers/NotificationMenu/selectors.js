import { createSelector } from 'reselect';
import { selectResourcesDomain } from 'utils/resources/selectors';

const selectNotifications = (state) => state.get('notificationMenu');

const makeSelectNotifications = () => createSelector(
  selectNotifications,
  selectResourcesDomain(),
  (notificationMenuState, resources) => {
    const ids = notificationMenuState.get('notifications');
    const notifications = resources.get('notification');
    return notifications && ids.map((id) => notifications.get(id));
  }
);

export default selectNotifications;
export {
  makeSelectNotifications,
};
