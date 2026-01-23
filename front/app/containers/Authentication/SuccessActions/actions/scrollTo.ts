import { IPhaseData } from 'api/phases/types';

import clHistory from 'utils/cl-router/history';
import { scrollToElement } from 'utils/scroll';

export interface ScrollToParams {
  elementId: string;
  pathname: string;
  projectSlug: string;
  currentPhase: IPhaseData | undefined;
}

export const scrollTo =
  ({ elementId, pathname, projectSlug, currentPhase }: ScrollToParams) =>
  () => {
    const isOnProjectPage = pathname.endsWith(`/projects/${projectSlug}`);

    const currentPhaseExists = !!currentPhase;

    if (currentPhaseExists) {
      // To get the current phase, we only need to navigate to the project page- if
      // no phase parameter is provided it will automatically select the current phase
      clHistory.push(`/projects/${projectSlug}`);
    }

    if (isOnProjectPage) {
      scrollToElement({ id: elementId });
    } else {
      clHistory.push(`/projects/${projectSlug}#${elementId}`);
    }
  };
