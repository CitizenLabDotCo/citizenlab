import { renderHook } from 'utils/testUtils/rtl';

import useIdConfigEnabled from './useIdConfigEnabled';

let mockFeatureEnabled = false;
jest.mock('hooks/useFeatureFlag', () => () => mockFeatureEnabled);

let mockSearch: Record<string, string> = {};
jest.mock('utils/router', () => ({
  ...jest.requireActual('utils/router'),
  useSearch: () => mockSearch,
}));

const renderIt = () => renderHook(() => useIdConfigEnabled()).result.current;

describe('useIdConfigEnabled', () => {
  beforeEach(() => {
    mockFeatureEnabled = false;
    mockSearch = {};
  });

  it('is true when the id_config feature is enabled', () => {
    mockFeatureEnabled = true;
    expect(renderIt()).toBe(true);
  });

  it('is false when the feature is off and there is no param', () => {
    expect(renderIt()).toBe(false);
  });

  it('is false for any other param value', () => {
    mockSearch = { id_config: 'true' };
    expect(renderIt()).toBe(false);
  });

  it('is true with ?id_config=enabled', () => {
    mockSearch = { id_config: 'enabled' };
    expect(renderIt()).toBe(true);
  });
});
