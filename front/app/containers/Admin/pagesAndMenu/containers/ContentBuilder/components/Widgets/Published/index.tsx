import React from 'react';

import { Multiloc } from 'typings';

import useAdminPublications from 'api/admin_publications/useAdminPublications';

import AdminPublicationsCarrousel from '../_shared/AdminPublicationsCarrousel';
import Skeleton from '../_shared/AdminPublicationsCarrousel/Skeleton';
import { CarrouselContainer } from '../_shared/BaseCarrousel/Containers';
import CarrouselTitle from '../_shared/CarrouselTitle';
import EmptyState from '../_shared/EmptyState';
import useLocalizeWithFallback from '../_shared/useLocalizeWithFallback';

import messages from './messages';
import Settings from './Settings';

interface Props {
  titleMultiloc: Multiloc;
  folderId?: string;
}

const Published = ({ titleMultiloc, folderId }: Props) => {
  const localizeWithFallback = useLocalizeWithFallback();

  const { data, hasNextPage, fetchNextPage, isInitialLoading } =
    useAdminPublications({
      pageSize: 6,
      publicationStatusFilter: ['published'],
      childrenOfId: folderId,
      rootLevelOnly: !folderId,
      removeNotAllowedParents: true,
      include_publications: true,
      remove_all_unlisted: true,
    });

  const adminPublications = data?.pages.map((page) => page.data).flat();
  const title = localizeWithFallback(titleMultiloc, publishedTitle);

  if (isInitialLoading) {
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
