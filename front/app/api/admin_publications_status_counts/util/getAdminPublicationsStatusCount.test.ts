import getStatusCounts from './getAdminPublicationsStatusCount';

describe('getStatusCounts', () => {
  it('returns the correct status count when data is present', () => {
    const result = getStatusCounts({
      data: {
        type: 'status_counts',
        attributes: {
          status_counts: {
            draft: 1,
            published: 2,
            archived: 3,
          },
        },
      },
    });
    expect(result).toEqual({
      draft: 1,
      published: 2,
      archived: 3,
      all: 6,
    });
  });
  it('returns the correct status count when 0', () => {
    const result = getStatusCounts({
      data: {
        type: 'status_counts',
        attributes: {
          status_counts: {},
        },
      },
    });
    expect(result).toEqual({
      all: 0,
    });
  });
});
