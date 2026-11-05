import React from 'react';

import { Multiloc } from 'typings';

import useAdminPublications from 'api/admin_publications/useAdminPublications';
import { PublicationStatus } from 'api/projects/types';

import AdminPublicationsCarrousel from 'components/admin/ContentBuilder/Widgets/_shared/AdminPublicationsCarrousel';
import Skeleton from 'components/admin/ContentBuilder/Widgets/_shared/AdminPublicationsCarrousel/Skeleton';
import { CarrouselContainer } from 'components/admin/ContentBuilder/Widgets/_shared/BaseCarrousel/Containers';
import CarrouselTitle from 'components/admin/ContentBuilder/Widgets/_shared/CarrouselTitle';
import EmptyState from 'components/admin/ContentBuilder/Widgets/_shared/EmptyState';
import useLocalizeWithFallback from 'components/admin/ContentBuilder/Widgets/_shared/useLocalizeWithFallback';

import messages from './messages';
import Settings from './Settings';

interface Props {
  titleMultiloc: Multiloc;
  folderId?: string;
}

const getPublicationStatuses = (folderId?: string): PublicationStatus[] =>
  folderId ? ['published', 'archived'] : ['published'];

const Published = ({ titleMultiloc, folderId }: Props) => {
  const localizeWithFallback = useLocalizeWithFallback();

  const { data, hasNextPage, fetchNextPage, isLoading } = useAdminPublications({
    pageSize: 6,
    publicationStatusFilter: getPublicationStatuses(folderId),
    childrenOfId: folderId,
    rootLevelOnly: !folderId,
    removeNotAllowedParents: true,
    include_publications: true,
    remove_all_unlisted: true,
  });

  const adminPublications = data?.pages.map((page) => page.data).flat();
  const title = localizeWithFallback(titleMultiloc, publishedTitle);

  if (isLoading) {
    return <Skeleton title={title} />;
  }

  if (!adminPublications) return null;
  if (adminPublications.length === 0) {
    return <EmptyState title={title} explanation={messages.noData} />;
  }

  return (
    <CarrouselContainer className="e2e-published-projects-and-folders">
      <CarrouselTitle>{title}</CarrouselTitle>
      <AdminPublicationsCarrousel
        adminPublications={adminPublications}
        hasMore={!!hasNextPage}
        onLoadMore={fetchNextPage}
      />
    </CarrouselContainer>
  );
};

Published.craft = {
  related: {
    settings: Settings,
  },
  custom: {
    title: messages.publishedTitle,
  },
};

export const publishedTitle = messages.publishedTitle;

export default Published;
