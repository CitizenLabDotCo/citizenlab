import { IAdminPublicationData } from './types';

export const isFolder = (publication: IAdminPublicationData) =>
  publication.relationships.publication.data.type === 'folder';
