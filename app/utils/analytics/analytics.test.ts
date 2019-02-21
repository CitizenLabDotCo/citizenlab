import { trackIdentification } from '.';
import { makeUser } from 'services/__mocks__/users';

jest.mock('services/tenant');
jest.mock('services/auth');

const originalAnalytics =  (global as any).analytics;
const identifyMock = jest.fn();

describe('trackIdentification', () => {
  beforeEach(() => {
     (global as any).analytics = {
      identify: identifyMock,
    };
  });

  it('calls analytics.identify with the correct parameters', () => {
    const user = makeUser();
    trackIdentification(user);
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
        tenantLifecycleStage: undefined,
        tenantName: 'wonderville',
        tenantOrganizationType: 'medium_city',
      }
    );
  });
  afterEach(() => {
     (global as any).analytics = originalAnalytics;
  });
});
