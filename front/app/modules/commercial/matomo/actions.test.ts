import { trackPageChange } from './actions';
import { mockRoutes } from './mockRoutes.mock';
import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { queryClient } from 'utils/cl-react-query/queryClient';
import ideasKeys from 'api/ideas/keys';

jest.mock('services/auth');

jest.mock('routes', () => ({
  __esModule: true,
  default: jest.fn(() => [mockRoutes]),
}));

let mockProject;
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

describe('trackPageChange', () => {
  beforeEach(() => {
    queryClient.setQueryData(ideasKeys.itemSlug('some-idea'), mockIdea);
    window._paq = [];
    mockProject = {
      data: { id: 'project-id' },
    };
  });

  it('sets locale if locale in path', async () => {
    await trackPageChange('/nl-NL/projects');
    expect(window._paq[0]).toEqual(['setCustomDimension', 3, 'nl-NL']);
  });

  it('does not set locale if locale not in path', async () => {
    await trackPageChange('/projects');
    expect(window._paq[0]).not.toEqual(['setCustomDimension', 3, 'nl-NL']);
  });

  it('sets project id if path is project page', async () => {
    await trackPageChange('/en/projects/some-project');
    expect(window._paq[1]).toEqual(['setCustomDimension', 4, 'project-id']);
  });

  it('sets project id path is idea', async () => {
    queryClient.setQueryData(ideasKeys.itemSlug('some-idea'), mockIdea);
    await trackPageChange('/en/ideas/some-idea');
    expect(window._paq[1]).toEqual(['setCustomDimension', 4, 'project-id2']);
  });

  it('sets project id if path is projects/:slug/ideas/new', async () => {
    await trackPageChange('/en/projects/some-project/ideas/new');
    expect(window._paq[1]).toEqual(['setCustomDimension', 4, 'project-id']);
  });

  it('removes project id when navigation away from project page', async () => {
    await trackPageChange('/en/projects/some-project');
    window._paq = [];
    await trackPageChange('/en');
    expect(window._paq[1]).toEqual(['setCustomDimension', 4]);
  });

  it('does not set project id if stream returns null', async () => {
    mockProject = null;
    await trackPageChange('/en/projects/some-project');
    expect(window._paq[1]).not.toEqual(['setCustomDimension', 4, 'project-id']);
  });

  it('does not set project id if stream returns error', async () => {
    mockProject = new Error();
    await trackPageChange('/en/projects/some-project');
    expect(window._paq[1]).not.toEqual(['setCustomDimension', 4, 'project-id']);
  });
});
