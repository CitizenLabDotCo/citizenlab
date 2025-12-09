import React from 'react';

import { Multiloc } from 'typings';

import useAdminPublicationsByIds from 'api/admin_publications/useAdminPublicationsByIds';

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
  adminPublicationIds: string[];
}

const Selection = ({ titleMultiloc, adminPublicationIds }: Props) => {
  const localizeWithFallback = useLocalizeWithFallback();
  const { data, hasNextPage, fetchNextPage, isInitialLoading } =
    useAdminPublicationsByIds(
      {
        ids: adminPublicationIds,
        pageSize: 6,
      },
      {
        enabled: adminPublicationIds.length > 0,
      }
    );

  const adminPublications = data?.pages.map((page) => page.data).flat();

  const showEmptyState =
    adminPublicationIds.length === 0 || adminPublications?.length === 0;

  const title = localizeWithFallback(titleMultiloc, selectionTitle);

  if (showEmptyState) {
    return <EmptyState title={title} explanation={messages.noData} />;
  }

  if (isInitialLoading) {
    return <Skeleton title={title} />;
  }

  if (!adminPublications) return null;

  return (
    <CarrouselContainer>
      <CarrouselTitle>{title}</CarrouselTitle>
      <AdminPublicationsCarrousel
        adminPublications={adminPublications}
        hasMore={!!hasNextPage}
        onLoadMore={fetchNextPage}
      />
    </CarrouselContainer>
  );
};

Selection.craft = {
  related: {
    settings: Settings,
  },
  custom: {
    title: messages.selectionTitle,
  },
};

export const selectionTitle = messages.selectionTitle;

export default Selection;
