import { makeUser } from 'services/__mocks__/users';
import { __setMockAuthUser, authUserObservable } from 'services/__mocks__/auth';
import { IEvent, trackEvent, trackPage } from '.';

jest.mock('services/tenant');
jest.mock('services/auth');

const originalAnalytics = (global as any).analytics;
const identifyMock = jest.fn();
const pageMock = jest.fn();
const trackMock = jest.fn();
const groupMock = jest.fn();

beforeEach(() => {
  (global as any).analytics = {
    identify: identifyMock,
    page: pageMock,
    track: trackMock,
    group: groupMock,
  };
});

afterEach(() => {
  (global as any).analytics = originalAnalytics;
});

describe('trackIdentification', () => {
  it('calls analytics.identify with the correct parameters', () => {
    const user = makeUser();

    authUserObservable.toPromise().then(() => {
      expect(identifyMock).toBeCalledWith(
        user.data.id,
        {
          avatar: null,
          birthday: undefined,
          createdAt: '2018-11-26T15:41:19.782Z',
          email: 'test@citizenlab.co',
          firstName: 'Test',
          gender: undefined,
          lastName: 'Citizenlab',
          locale: 'en',
          isSuperAdmin: false,
          isAdmin: false,
          isProjectModerator: false,
          highestRole: 'user',
          tenantHost: 'wonderville.com',
          tenantId: 'c4b400e1-1786-5be2-af55-40730c6a843d',
          tenantLifecycleStage: 'active',
          tenantName: 'wonderville',
          tenantOrganizationType: 'medium_city',
        },
        {
          integrations: {
            All: true,
            Intercom: false,
            SatisMeter: false,
          },
        }
      );
      expect(groupMock).toBeCalledWith(
        'c4b400e1-1786-5be2-af55-40730c6a843d',
        {
          name: 'wonderville',
          website: 'https://www.wonder.ville',
          avatar: 'http://fepe.et/fivacsok.jpg',
          tenantLocales: ['en'],
          tenantId: 'c4b400e1-1786-5be2-af55-40730c6a843d',
          tenantName: 'wonderville',
          tenantHost: 'wonderville.com',
          tenantOrganizationType: 'medium_city',
          tenantLifecycleStage: 'active',
        },
        {
          integrations: {
            Intercom: false,
            SatisMeter: false,
          },
        }
      );
    });
  });
});

describe('trackEvent', () => {
  it('calls analytics.track with the correct parameters', () => {
    const event: IEvent = {
      name: 'Clicked button',
      properties: {
        button_type: 'cta',
      },
    };

    trackEvent(event);

    expect(trackMock).toBeCalledWith(
      'Clicked button',
      {
        button_type: 'cta',
        location: '/en/',
        tenantHost: 'wonderville.com',
        tenantId: 'c4b400e1-1786-5be2-af55-40730c6a843d',
        tenantLifecycleStage: 'active',
        tenantName: 'wonderville',
        tenantOrganizationType: 'medium_city',
      },
      {
        integrations: {
          Intercom: false,
          SatisMeter: false,
        },
      }
    );
  });
});

describe('trackPage', () => {
  it('calls analytics.page with the correct parameters', () => {
    trackPage('/home', { weather: 'sunny' });

    expect(pageMock).toBeCalledWith(
      '',
      {
        path: '/home',
        url: 'https://wonderville.com/home',
        title: null,
        tenantHost: 'wonderville.com',
        tenantId: 'c4b400e1-1786-5be2-af55-40730c6a843d',
        tenantLifecycleStage: 'active',
        tenantName: 'wonderville',
        tenantOrganizationType: 'medium_city',
        weather: 'sunny',
      },
      {
        integrations: {
          Intercom: false,
          SatisMeter: false,
        },
      }
    );
  });
});
