import { addDays } from 'date-fns';

import { getPreviewPhaseAttributes, PreviewSnapshot } from './types';

// Events of the phase being edited, including past ones, since the preview can
// simulate any lifecycle. A phase without dates yet gets an open-ended period.
export const getPreviewEventsPeriod = (preview: PreviewSnapshot) => {
  const { start_at, end_at } = getPreviewPhaseAttributes(preview);

  return {
    currentAndFutureOnly: false,
    ongoing_during: [
      start_at ? new Date(start_at).toISOString() : null,
      end_at ? addDays(new Date(end_at), 1).toISOString() : null,
    ],
  };
};
