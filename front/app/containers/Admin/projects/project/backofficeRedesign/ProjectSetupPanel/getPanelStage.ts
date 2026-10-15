import { IProjectData } from 'api/projects/types';

export type PanelStage = 'draft' | 'live' | 'wrapped' | 'archived';

const getPanelStage = (project: IProjectData): PanelStage => {
  const { publication_status, participation_status } = project.attributes;

  if (publication_status === 'archived') return 'archived';
  if (publication_status !== 'published') return 'draft';
  return participation_status === 'ended' ? 'wrapped' : 'live';
};

export default getPanelStage;
