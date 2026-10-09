import { IProjectData } from 'api/projects/types';

export type PublicationState = 'published' | 'archived' | 'scheduled' | 'draft';

const getPublicationState = (project: IProjectData): PublicationState => {
  const { publication_status, scheduled_at } = project.attributes;

  if (publication_status === 'published') return 'published';
  if (publication_status === 'archived') return 'archived';
  return scheduled_at ? 'scheduled' : 'draft';
};

export default getPublicationState;
