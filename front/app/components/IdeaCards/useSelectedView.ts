import { useEffect } from 'react';

import { PresentationMode } from 'api/phases/types';
import { getSelectedView } from 'api/phases/utils';

import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

interface Props {
  requestedView?: PresentationMode;
  availableViews?: PresentationMode[];
  defaultView: PresentationMode;
}

// Rewrites ?view= when it names a view the phase does not offer, so that a stale link self-heals
// rather than staying out of step with what is rendered. The value is derived first: the rewrite
// only lands after paint, and rendering the requested view until then is the flash we are avoiding.
const useSelectedView = ({
  requestedView,
  availableViews,
  defaultView,
}: Props): PresentationMode => {
  const selectedView = getSelectedView({
    requestedView,
    availableViews,
    defaultView,
  });

  useEffect(() => {
    if (requestedView && requestedView !== selectedView) {
      updateSearchParams({ view: selectedView });
    }
  }, [requestedView, selectedView]);

  return selectedView;
};

export default useSelectedView;
