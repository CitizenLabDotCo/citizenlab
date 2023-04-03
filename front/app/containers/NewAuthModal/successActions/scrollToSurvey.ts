import { scrollToElement } from 'utils/scroll';
import { selectPhase } from 'containers/ProjectsShowPage/timeline/events';
import clHistory from 'utils/cl-router/history';
import { IPhaseData } from 'services/phases';

interface Params {
  pathname: string;
  projectSlug: string;
  currentPhase: IPhaseData | null;
}

export const scrollToSurvey =
  ({ pathname, projectSlug, currentPhase }: Params) =>
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
