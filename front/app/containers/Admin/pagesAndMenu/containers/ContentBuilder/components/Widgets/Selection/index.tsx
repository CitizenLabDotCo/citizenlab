import React from 'react';

import { Multiloc } from 'typings';

import useAdminPublicationsByIds from 'api/admin_publications/useAdminPublicationsByIds';

import AdminPublicationsCarrousel from '../_shared/AdminPublicationsCarrousel';
import Skeleton from '../_shared/AdminPublicationsCarrousel/Skeleton';
import { CarrouselContainer } from '../_shared/BaseCarrousel/Containers';
import EmptyState from '../_shared/EmptyState';
import useLocalizeWithFallback from '../_shared/useLocalizeWithFallback';

import messages from './messages';
import Settings from './Settings';
import { Title } from '@citizenlab/cl2-component-library';

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
      <Title
        variant="h2"
        mt="0px"
        // ml={isSmallerThanPhone ? DEFAULT_PADDING : undefined}
        color="tenantText"
      >
        {title}
      </Title>
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
};

export const selectionTitle = messages.selectionTitle;

export default Selection;
