import { IProjectData } from 'api/projects/types';

export type PanelStage = 'draft' | 'live' | 'archived';

const getPanelStage = (project: IProjectData): PanelStage => {
  const { publication_status } = project.attributes;

  if (publication_status === 'archived') return 'archived';
  if (publication_status !== 'published') return 'draft';
  return 'live';
};

export default getPanelStage;
