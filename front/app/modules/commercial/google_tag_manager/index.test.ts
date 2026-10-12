import { customerAnalyticsEvents, trackEventByName } from 'utils/analytics';
import eventEmitter from 'utils/eventEmitter';

import config from '.';

jest.mock('api/app_configuration/appConfigurationStream', () => {
  const { BehaviorSubject } = jest.requireActual('rxjs');
  const { appConfigurationData } = jest.requireActual(
    'api/app_configuration/__mocks__/useAppConfiguration'
  );

  return {
    __esModule: true,
    default: new BehaviorSubject({
      data: {
        ...appConfigurationData,
        attributes: {
          ...appConfigurationData.attributes,
          settings: {
            ...appConfigurationData.attributes.settings,
            google_tag_manager: {
              allowed: true,
              enabled: true,
              container_id: '',
              destinations: '',
              category: 'analytics',
            },
          },
        },
      },
    }),
  };
});

describe('google_tag_manager', () => {
  beforeAll(() => {
    config.beforeMountApplication?.();
  });

  beforeEach(() => {
    window.dataLayer = [];
  });

  it('pushes only customer analytics events to the dataLayer, once consent is given', () => {
    trackEventByName(customerAnalyticsEvents.commentPosted, {
      idea_id: 'idea-1',
    });
    trackEventByName('Clicked a button');

    expect(window.dataLayer).toEqual([]);

    eventEmitter.emit('destinationConsentChanged', {
      google_tag_manager: true,
    });

    expect(window.dataLayer).toEqual([
      { event: 'comment_posted', idea_id: 'idea-1' },
    ]);

    trackEventByName(customerAnalyticsEvents.volunteered, {
      cause_id: 'cause-1',
    });
    trackEventByName('Clicked a button');

    expect(window.dataLayer).toEqual([
      { event: 'comment_posted', idea_id: 'idea-1' },
      { event: 'volunteered', cause_id: 'cause-1' },
    ]);
  });
});
