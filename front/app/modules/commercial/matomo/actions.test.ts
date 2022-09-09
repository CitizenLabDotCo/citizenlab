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
  data: { relationships: { project: { data: { id: 'project-id' } } } },
};

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
  });

  it('sets locale custom dimension if locale in path', async () => {
    await trackPageChange('/nl-NL/projects');
    expect(window._paq[0]).toEqual(['setCustomDimension', 3, 'nl-NL']);
  });

  it('does not set locale custom dimension if locale not in path', async () => {
    await trackPageChange('/projects');
    expect(window._paq[0][0]).not.toEqual('setCustomDimension');
    expect(window._paq[0][1]).not.toEqual(3);
  });

  it('gets project id if path is project page', async () => {
    await trackPageChange('/en/projects/some-project');
    expect(window._paq[1]).toEqual(['setCustomDimension', 4, 'project-id']);
  });

  it('gets project id path is idea', async () => {
    await trackPageChange('/en/ideas/some-idea');
    expect(window._paq[1]).toEqual(['setCustomDimension', 4, 'project-id']);
  });

  // TODO test new idea, edit idea etc paths

  // TODO test errors/null responses
});
