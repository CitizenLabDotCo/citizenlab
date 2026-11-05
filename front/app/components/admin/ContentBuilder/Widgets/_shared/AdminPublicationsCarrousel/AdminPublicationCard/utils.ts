import { IAdminPublicationData } from 'api/admin_publications/types';

export const getPublicationLinkProps = (publication: IAdminPublicationData) => {
  const { publication_slug } = publication.attributes;
  const publicationType = publication.relationships.publication.data.type;

  if (publicationType === 'folder') {
    return {
      to: '/folders/$slug',
      params: { slug: publication_slug },
    } as const;
  }
  return {
    to: '/projects/$slug',
    params: { slug: publication_slug },
  } as const;
};
