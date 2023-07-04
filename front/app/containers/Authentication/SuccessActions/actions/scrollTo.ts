import { scrollToElement } from 'utils/scroll';
import clHistory from 'utils/cl-router/history';
import { IPhaseData } from 'api/phases/types';

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

    if (currentPhase) {
      selectCurrentPhase(projectSlug);
    }

    if (isOnProjectPage) {
      scrollToElement({ id: elementId, shouldFocus: true });
    } else {
      clHistory.push(`/projects/${projectSlug}#${elementId}`);
    }
  };

const selectCurrentPhase = (projectSlug: string) => {
  clHistory.push(`/projects/${projectSlug}`);
};
