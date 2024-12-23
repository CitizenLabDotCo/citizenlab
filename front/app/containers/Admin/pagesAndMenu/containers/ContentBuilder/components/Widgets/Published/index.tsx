import React from 'react';

import { Multiloc } from 'typings';

import useAdminPublications from 'api/admin_publications/useAdminPublications';

import useLocalize from 'hooks/useLocalize';

import AdminPublicationsCarrousel from '../_shared/AdminPublicationsCarrousel';
import Skeleton from '../_shared/AdminPublicationsCarrousel/Skeleton';
import EmptyState from '../_shared/EmptyState';

import messages from './messages';
import Settings from './Settings';

interface Props {
  titleMultiloc: Multiloc;
}

const Published = ({ titleMultiloc }: Props) => {
  const localize = useLocalize();

  const { data, hasNextPage, fetchNextPage, isInitialLoading } =
    useAdminPublications({
      pageSize: 6,
      publicationStatusFilter: ['published'],
      rootLevelOnly: true,
      removeNotAllowedParents: true,
      include_publications: true,
    });

  const adminPublications = data?.pages.map((page) => page.data).flat();
  const title = localize(titleMultiloc);

  if (isInitialLoading) {
    return <Skeleton title={title} />;
  }

  if (!adminPublications) return null;
  if (adminPublications.length === 0) {
    return (
      <EmptyState titleMultiloc={titleMultiloc} explanation={messages.noData} />
    );
  }

  return (
    <AdminPublicationsCarrousel
      title={title}
      adminPublications={adminPublications}
      hasMore={!!hasNextPage}
      className="e2e-published-projects-and-folders"
      onLoadMore={fetchNextPage}
    />
  );
};

Published.craft = {
  related: {
    settings: Settings,
  },
};

export const publishedTitle = messages.publishedTitle;

export default Published;
