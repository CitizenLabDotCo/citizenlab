import { queryClient } from 'utils/cl-react-query/queryClient';

export const PREVIEW_PAINTED = 'preview-painted';

// How long the page has to stay unchanged, with no data loading, to count as painted.
const QUIET_MS = 300;

const hasSameOriginParent = () => {
  try {
    return (
      window.parent !== window &&
      window.parent.location.origin === window.location.origin
    );
  } catch {
    return false;
  }
};

// Inside a back-office phone preview, tells the editor once the page shows its
// content, so the phone can drop its skeleton then rather than show our spinners.
export const announcePaintedToPreviewParent = () => {
  if (!hasSameOriginParent()) return;

  let timer: number | undefined;
  let stop = () => {};

  const announce = () => {
    if (queryClient.isFetching() > 0) return;

    stop();
    window.parent.postMessage(
      { type: PREVIEW_PAINTED },
      window.location.origin
    );
  };

  // Every change to the page or to a query starts the quiet period again.
  const wait = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(announce, QUIET_MS);
  };

  const observer = new MutationObserver(wait);
  const unsubscribe = queryClient.getQueryCache().subscribe(wait);
  stop = () => {
    observer.disconnect();
    unsubscribe();
  };

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  wait();
};
