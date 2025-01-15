import { renderHook } from 'utils/testUtils/rtl';

import useAnalysisFilterParams from './useAnalysisFilterParams';

const mockSearchParams = new URLSearchParams({
  search: 'example',
  tag_ids: '["1","2","3"]',
  'author_custom_c80c2e9c-db9d-4e49-8894-d042fba841fa': '["male"]',
  'author_custom_7e43a2e3-2fec-4c11-97c2-6bedb7f47910': '["somewhere_else"]',
  'author_custom_87e4f5d3-fb0b-4a87-89e4-837933afda6c_from': '2010',
  'author_custom_87e4f5d3-fb0b-4a87-89e4-837933afda6c_to': '2019',
  published_at_from: '2023-09-10',
  published_at_to: '2023-09-21',
  votes_from: '10',
  comments_from: '10',
  reactions_from: '10',
});

jest.mock('react-router-dom', () => ({
  useSearchParams: jest.fn(() => [mockSearchParams]),
}));

describe('useAnalysisFilterParams', () => {
  it('should return the filter params extracted from the URL', () => {
    const { result } = renderHook(() => useAnalysisFilterParams());

    expect(result.current).toEqual({
      search: 'example',
      'author_custom_7e43a2e3-2fec-4c11-97c2-6bedb7f47910': ['somewhere_else'],
      'author_custom_87e4f5d3-fb0b-4a87-89e4-837933afda6c_from': '2010',
      'author_custom_87e4f5d3-fb0b-4a87-89e4-837933afda6c_to': '2019',
      'author_custom_c80c2e9c-db9d-4e49-8894-d042fba841fa': ['male'],
      comments_from: 10,
      published_at_from: '2023-09-10',
      published_at_to: '2023-09-21',
      reactions_from: 10,
      tag_ids: ['1', '2', '3'],
      votes_from: 10,
    });
  });
});
