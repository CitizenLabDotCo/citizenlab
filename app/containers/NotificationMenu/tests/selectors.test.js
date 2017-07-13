import { fromJS } from 'immutable';
import { generateResourcesNotificationValue } from 'utils/testing/mocks';

import { makeSelectNotifications } from '../selectors';

describe('NotificationMenu selectors', () => {
  describe('makeSelectNotifications', () => {
    it('it should select user\'s notifications', () => {
      const selector = makeSelectNotifications();

      const state = {
        // page name nested for proper conversion by fromJS
        notificationMenu: {
          notifications: [],
        },
        resources: {
          notification: {},
        },
      };

      let i = 0;
      const attributes = {};
      while (i < 3) {
        state.notificationMenu.notifications.push(i.toString());
        state.resources.notification[i.toString()] = generateResourcesNotificationValue(i.toString(), attributes).data;

        i += 1;
      }

      const resourcesImm = fromJS(state.resources);
      const expectedResult = fromJS(state.notificationMenu.notifications).map((id) => resourcesImm.get('notification').get(id));

      expect(selector(fromJS(state))).toEqual(expectedResult);
    });
  });
});
