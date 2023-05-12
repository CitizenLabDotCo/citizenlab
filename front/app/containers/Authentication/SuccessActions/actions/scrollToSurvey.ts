import { scrollToElement } from 'utils/scroll';
import { selectPhase } from 'containers/ProjectsShowPage/timeline/events';
import clHistory from 'utils/cl-router/history';
import { IPhaseData } from 'api/phases/types';

export interface ScrollToSurveyParams {
  pathname: string;
  projectSlug: string;
  currentPhase: IPhaseData | undefined;
}

export const scrollToSurvey =
  ({ pathname, projectSlug, currentPhase }: ScrollToSurveyParams) =>
  async () => {
    const isOnProjectPage = pathname.endsWith(`/projects/${projectSlug}`);

    const id = 'project-survey';
    currentPhase && selectPhase(currentPhase);

    if (isOnProjectPage) {
      scrollToElement({ id, shouldFocus: true });
    } else {
      clHistory.push(`/projects/${projectSlug}#${id}`);
    }
  };
