import { useEffect, useState } from 'react';

import { ActionStatusState } from 'design-system/ActionStatus';

export interface BatchFeedback {
  state: ActionStatusState;
  message: string;
}

const DONE_VISIBLE_MS = 3000;

// Lives above the selection bar, so a result stays readable after a delete
// clears the selection.
const useBatchFeedback = () => {
  const [feedback, setFeedback] = useState<BatchFeedback>();

  useEffect(() => {
    if (feedback?.state !== 'done') return;

    const timeout = setTimeout(() => setFeedback(undefined), DONE_VISIBLE_MS);
    return () => clearTimeout(timeout);
  }, [feedback]);

  return {
    feedback,
    setFeedback,
    dismiss: () => setFeedback(undefined),
  };
};

export default useBatchFeedback;
