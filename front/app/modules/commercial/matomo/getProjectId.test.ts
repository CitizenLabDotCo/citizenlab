import ideasKeys from 'api/ideas/keys';
import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { queryClient } from 'utils/cl-react-query/queryClient';

import {
  extractIdeaSlug,
  getProjectId,
  isOnAdminProjectPage,
} from './getProjectId';

jest.mock('services/auth');

describe('extractIdeaSlug', () => {
  it('works for /ideas/:slug', () => {
    expect(extractIdeaSlug('/ideas/some-slug')).toEqual('some-slug');
  });
});

describe('isOnAdminProjectPage', () => {
  it('returns true when the link is a project admin page', () => {
    const isAdminLink = isOnAdminProjectPage(
      '/en/admin/projects/e20f63ae-1fe4-49be-8bf9-599cc34e6515'
    );
    expect(isAdminLink).toEqual(true);
  });

  it('returns false when the link is a project admin page', () => {
    const isAdminLink = isOnAdminProjectPage(
      '/en/projects/e20f63ae-1fe4-49be-8bf9-599cc34e6515'
    );
    expect(isAdminLink).toEqual(false);
  });
});

const mockProject = {
  data: { id: 'project-id' },
};
const mockProjectObservable = new Observable((subscriber) => {
  subscriber.next(mockProject);
}).pipe(delay(1));

jest.mock('services/projects', () => ({
  projectBySlugStream: jest.fn(() => ({
    observable: mockProjectObservable,
  })),
}));

const mockIdea = {
  data: { relationships: { project: { data: { id: 'project-id2' } } } },
};

describe('getProjectId', () => {
  beforeEach(() => {
    queryClient.setQueryData(ideasKeys.itemSlug('some-idea'), mockIdea);
  });
  it('returns the project id directly when the project link is an admin link', async () => {
    const projectId = await getProjectId(
      '/en/admin/projects/e20f63ae-1fe4-49be-8bf9-599cc34e6515'
    );
    expect(projectId).toEqual('e20f63ae-1fe4-49be-8bf9-599cc34e6515');
  });

  it('returns the project id when a non admin project link is passed', async () => {
    const projectId = await getProjectId('/en/projects/test-slug');
    expect(projectId).toEqual('project-id');
  });

  it('returns the project id when an idea link is passed', async () => {
    const projectId = await getProjectId('/en/ideas/some-idea');
    expect(projectId).toEqual('project-id2');
  });
});
