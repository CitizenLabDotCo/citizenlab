import { IUser, OfferedEarlyAccessFeatures } from 'api/users/types';

import { renderHook } from 'utils/testUtils/rtl';

import useEarlyAccess from './useEarlyAccess';

let mockAuthUser: IUser | undefined;
jest.mock('api/me/useAuthUser', () => () => ({ data: mockAuthUser }));

const buildUser = (offered: OfferedEarlyAccessFeatures, optedIn: string[]) =>
  ({
    data: {
      id: 'user-id',
      type: 'user',
      attributes: {
        early_access_opt_ins: optedIn,
        offered_early_access_features: offered,
      },
    },
  } as unknown as IUser);

const renderIt = () =>
  renderHook(() => useEarlyAccess('project_backoffice_redesign')).result
    .current;

describe('useEarlyAccess', () => {
  it('reports an offered feature the user opted into', () => {
    mockAuthUser = buildUser({ project_backoffice_redesign: 'internal' }, [
      'project_backoffice_redesign',
    ]);

    expect(renderIt()).toEqual({ offered: true, optedIn: true });
  });

  it('reports an offered feature the user has not opted into', () => {
    mockAuthUser = buildUser({ project_backoffice_redesign: 'internal' }, []);

    expect(renderIt()).toEqual({ offered: true, optedIn: false });
  });

  it('ignores a stored opt-in for a feature that is no longer offered', () => {
    mockAuthUser = buildUser({}, ['project_backoffice_redesign']);

    expect(renderIt()).toEqual({ offered: false, optedIn: false });
  });

  it('reports nothing when nobody is signed in', () => {
    mockAuthUser = undefined;

    expect(renderIt()).toEqual({ offered: false, optedIn: false });
  });
});
