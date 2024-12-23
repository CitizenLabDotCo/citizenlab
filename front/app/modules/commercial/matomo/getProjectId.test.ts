import ideasKeys from 'api/ideas/keys';

import { queryClient } from 'utils/cl-react-query/queryClient';

import { getProjectId } from './getProjectId';

const mockProject = {
  data: { id: 'project-id' },
};

jest.mock('api/projects/getProjectBySlug', () => ({
  __esModule: true,
  default: jest.fn(() => mockProject),
}));

const mockIdea = {
  data: { relationships: { project: { data: { id: 'project-id2' } } } },
};

describe('getProjectId', () => {
  beforeEach(() => {
    queryClient.setQueryData(ideasKeys.item({ slug: 'some-idea' }), mockIdea);
  });
  it('returns the project id when the project link is an admin link', async () => {
    const projectId = await getProjectId(
      '/en/admin/projects/e20f63ae-1fe4-49be-8bf9-599cc34e6515'
    );
    expect(projectId).toEqual('e20f63ae-1fe4-49be-8bf9-599cc34e6515');
  });

  it('returns the project id when a non admin project link is passed', async () => {
    const projectId = await getProjectId('/en/projects/test-slug');
    expect(projectId).toEqual('project-id');
  });

  // Regression test
  it('returns the project id when the slug does not contain any hyphens', async () => {
    const projectId = await getProjectId('/en/projects/testslug');
    expect(projectId).toEqual('project-id');
  });

  it('returns the project id when an idea link is passed', async () => {
    const projectId = await getProjectId('/en/ideas/some-idea');
    expect(projectId).toEqual('project-id2');
  });

  it.each(['/en/', '/en/pages/cookie-policy'])(
    'returns null when the path is %s',
    async (path) => {
      const projectId = await getProjectId(path);
      expect(projectId).toBeNull();
    }
  );
});
