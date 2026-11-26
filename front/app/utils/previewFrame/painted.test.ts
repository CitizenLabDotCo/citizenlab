import { queryClient } from 'utils/cl-react-query/queryClient';

import { PREVIEW_PAINTED, announcePaintedToPreviewParent } from './painted';

const postMessage = jest.fn();

// The page observer reports changes after the current task.
const changePage = async () => {
  document.body.appendChild(document.createElement('div'));
  await Promise.resolve();
};

// A stand-in parent window with only what the announcer reads.
const frameIn = (origin: string) =>
  jest.spyOn(window, 'parent', 'get').mockReturnValue({
    location: { origin },
    postMessage,
  } as unknown as Window);

describe('announcePaintedToPreviewParent', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    postMessage.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('tells a same-origin parent once the page has been quiet', async () => {
    frameIn(window.location.origin);
    announcePaintedToPreviewParent();

    jest.advanceTimersByTime(200);
    await changePage();
    jest.advanceTimersByTime(200);
    expect(postMessage).not.toHaveBeenCalled();

    jest.advanceTimersByTime(300);
    expect(postMessage).toHaveBeenCalledWith(
      { type: PREVIEW_PAINTED },
      window.location.origin
    );
  });

  it('waits while data is loading', async () => {
    frameIn(window.location.origin);
    const fetching = jest.spyOn(queryClient, 'isFetching').mockReturnValue(1);
    announcePaintedToPreviewParent();

    jest.advanceTimersByTime(1000);
    expect(postMessage).not.toHaveBeenCalled();

    fetching.mockReturnValue(0);
    await changePage();
    jest.advanceTimersByTime(300);
    expect(postMessage).toHaveBeenCalledTimes(1);
  });

  it('says nothing to a parent on another site', () => {
    frameIn('https://elsewhere.example');
    announcePaintedToPreviewParent();

    jest.advanceTimersByTime(1000);
    expect(postMessage).not.toHaveBeenCalled();
  });
});
