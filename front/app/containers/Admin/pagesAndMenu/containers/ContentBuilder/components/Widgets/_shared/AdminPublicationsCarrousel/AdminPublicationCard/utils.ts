import { RouteType } from 'routes';

import { IAdminPublicationData } from 'api/admin_publications/types';

export const getPublicationURL = (publication: IAdminPublicationData) => {
  const { publication_slug } = publication.attributes;
  const publicationType = publication.relationships.publication.data.type;

  return `/${publicationType}s/${publication_slug}` as RouteType;
};
