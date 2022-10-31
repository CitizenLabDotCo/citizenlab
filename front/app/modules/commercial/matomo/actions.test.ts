import { trackPageChange } from './actions';
import { mockRoutes } from './mockRoutes.mock';
import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

jest.mock('services/appConfiguration');
jest.mock('services/auth');
jest.mock('modules', () => ({ streamsToReset: [] }));
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

let mockIdea;

const mockIdeaObservable = new Observable((subscriber) => {
  subscriber.next(mockIdea);
}).pipe(delay(1));

jest.mock('services/ideas', () => ({
  ideaBySlugStream: jest.fn(() => ({
    observable: mockIdeaObservable,
  })),
}));

describe('trackPageChange', () => {
  beforeEach(() => {
    window._paq = [];
    mockProject = {
      data: { id: 'project-id' },
    };
    mockIdea = {
      data: { relationships: { project: { data: { id: 'project-id2' } } } },
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
