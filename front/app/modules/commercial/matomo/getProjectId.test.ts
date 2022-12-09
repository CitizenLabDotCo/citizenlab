import { extractIdeaSlug } from './getProjectId';

jest.mock('services/appConfiguration');
jest.mock('services/auth');

describe('extractIdeaSlug', () => {
  it('works for /ideas/:slug', () => {
    expect(extractIdeaSlug('/ideas/some-slug')).toEqual('some-slug');
  });
});
