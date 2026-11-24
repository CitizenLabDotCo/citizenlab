import { IdMethodData } from 'api/id_methods/types';

import { renderHook } from 'utils/testUtils/rtl';

import useVisibleIdMethodsExceptFC from './useVisibleIdMethodsExceptFC';

let mockIdMethods: { data: IdMethodData[] } = { data: [] };
let mockPathname = '/en/sign-in';

jest.mock('api/id_methods/useIdMethods', () =>
  jest.fn(() => ({ data: mockIdMethods }))
);

jest.mock('utils/router', () => ({
  useLocation: () => ({ pathname: mockPathname }),
}));

const baseAttributes = {
  authentication_method: true,
  verification_method: false,
};

const okta = (visibility?: 'show' | 'link' | 'hide'): IdMethodData => ({
  id: 'okta',
  type: 'id_method',
  attributes: { ...baseAttributes, name: 'okta', visibility },
});

const azure = (visibility?: 'show' | 'link' | 'hide'): IdMethodData => ({
  id: 'azure',
  type: 'id_method',
  attributes: { ...baseAttributes, name: 'azureactivedirectory', visibility },
});

const google: IdMethodData = {
  id: 'google',
  type: 'id_method',
  attributes: { ...baseAttributes, name: 'google' },
};

const franceconnect: IdMethodData = {
  id: 'franceconnect',
  type: 'id_method',
  attributes: { ...baseAttributes, name: 'franceconnect' },
};

const visibleNames = () =>
  renderHook(() => useVisibleIdMethodsExceptFC()).result.current.map(
    (method) => method.attributes.name
  );

describe('useVisibleIdMethodsExceptFC', () => {
  beforeEach(() => {
    mockPathname = '/en/sign-in';
  });

  it('always leaves out FranceConnect', () => {
    mockIdMethods = { data: [franceconnect, google] };

    expect(visibleNames()).toEqual(['google']);
  });

  it('shows staff methods with "show" or no visibility', () => {
    mockIdMethods = { data: [okta('show'), azure(undefined), google] };

    expect(visibleNames()).toEqual(['okta', 'azureactivedirectory', 'google']);
  });

  it('hides staff methods with "link" or "hide" visibility', () => {
    mockIdMethods = { data: [okta('link'), azure('hide'), google] };

    expect(visibleNames()).toEqual(['google']);
  });

  it('shows hidden staff methods on the admin sign-in page', () => {
    mockPathname = '/en/sign-in/admin';
    mockIdMethods = { data: [okta('hide'), azure('link'), google] };

    expect(visibleNames()).toEqual(['okta', 'azureactivedirectory', 'google']);
  });
});
