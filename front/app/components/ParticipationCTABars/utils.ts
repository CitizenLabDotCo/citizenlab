import { IPhaseData } from 'services/phases';
import { IProjectData } from 'services/projects';

export type CTABarProps = {
  project: IProjectData;
  phases: Error | IPhaseData[] | null | undefined;
};
