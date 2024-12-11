import React from 'react';

import { Multiloc } from 'typings';

import useAdminPublicationsByIds from 'api/admin_publications/useAdminPublicationsByIds';

import useLocalize from 'hooks/useLocalize';

import AdminPublicationsCarrousel from '../_shared/AdminPublicationsCarrousel';
import Skeleton from '../_shared/AdminPublicationsCarrousel/Skeleton';
import EmptyState from '../_shared/EmptyState';

import messages from './messages';
import Settings from './Settings';

interface Props {
  titleMultiloc: Multiloc;
  adminPublicationIds: string[];
}

const Selection = ({ titleMultiloc, adminPublicationIds }: Props) => {
  const localize = useLocalize();
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

  if (showEmptyState) {
    return (
      <EmptyState titleMultiloc={titleMultiloc} explanation={messages.noData} />
    );
  }

  const title = localize(titleMultiloc);

  if (isInitialLoading) {
    return <Skeleton title={title} />;
  }

  if (!adminPublications) return null;

  return (
    <AdminPublicationsCarrousel
      title={title}
      adminPublications={adminPublications}
      hasMore={!!hasNextPage}
      onLoadMore={fetchNextPage}
    />
  );
};

Selection.craft = {
  related: {
    settings: Settings,
  },
};

export const selectionTitle = messages.selectionTitle;

export default Selection;
