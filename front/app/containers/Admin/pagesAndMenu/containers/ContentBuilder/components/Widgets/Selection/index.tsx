import React from 'react';

import { Multiloc } from 'typings';

import useAdminPublicationsByIds from 'api/admin_publications/useAdminPublicationsByIds';

import useLocalize from 'hooks/useLocalize';

import AdminPublicationsCarrousel from '../_shared/AdminPublicationsCarrousel';
import EmptyState from '../_shared/EmptyState';

import messages from './messages';
import Settings from './Settings';

interface Props {
  titleMultiloc: Multiloc;
  adminPublicationIds: string[];
}

const Selection = ({ titleMultiloc, adminPublicationIds }: Props) => {
  const localize = useLocalize();
  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
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

  if (!adminPublications) return null;

  return (
    <AdminPublicationsCarrousel
      title={localize(titleMultiloc)}
      adminPublications={adminPublications}
      hasMore={!!hasNextPage}
      isLoadingMore={isFetchingNextPage}
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
