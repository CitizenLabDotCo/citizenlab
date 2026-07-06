import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

export type CTABarProps = {
  project: IProjectData;
  phases: IPhaseData[] | undefined;
};
