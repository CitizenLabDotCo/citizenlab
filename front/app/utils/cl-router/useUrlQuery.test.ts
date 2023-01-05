import useURLQuery from './useUrlQuery';
import { renderHook } from '@testing-library/react-hooks';

jest.mock('react-router-dom', () => {
  return {
    useLocation: () => ({
      search: '?param1=param1&param2=param2',
    }),
  };
});

describe('useUrlQuery', () => {
  it('returns correct url query params', () => {
    const { result } = renderHook(() => useURLQuery());

    expect(result.current.get('param1')).toBe('param1');
    expect(result.current.get('param2')).toBe('param2');
  });
});
