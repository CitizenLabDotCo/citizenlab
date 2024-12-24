import { InfiniteData } from '@tanstack/react-query';
import { FormatMessage } from 'typings';

import {
  IAdminPublicationData,
  IAdminPublications,
} from 'api/admin_publications/types';

import { Localize } from 'hooks/useLocalize';

import messages from '../messages';

export const flattenPagesData = (
  data?: InfiniteData<IAdminPublications>
): IAdminPublicationData[] | undefined => {
  return data?.pages
    .map((page: { data: IAdminPublicationData[] }) => page.data)
    .flat();
};

export const getLabel = (
  adminPublication: IAdminPublicationData,
  localize: Localize,
  formatMessage: FormatMessage
) => {
  const { type } = adminPublication.relationships.publication.data;
  const title = localize(
    adminPublication.attributes.publication_title_multiloc
  );

  if (type === 'folder') {
    return `(${formatMessage(messages.folder)}) ${title}`;
  }

  return title;
};
