import React from 'react';

import { Title, useBreakpoint } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import useAdminPublications from 'api/admin_publications/useAdminPublications';

import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';

import AdminPublicationsCarrousel from '../_shared/AdminPublicationsCarrousel';
import Skeleton from '../_shared/AdminPublicationsCarrousel/Skeleton';
import { CarrouselContainer } from '../_shared/BaseCarrousel/Containers';
import EmptyState from '../_shared/EmptyState';
import useLocalizeWithFallback from '../_shared/useLocalizeWithFallback';

import messages from './messages';
import Settings from './Settings';

interface Props {
  titleMultiloc: Multiloc;
}

const Published = ({ titleMultiloc }: Props) => {
  const isSmallerThanPhone = useBreakpoint('phone');
  const localizeWithFallback = useLocalizeWithFallback();

  const { data, hasNextPage, fetchNextPage, isInitialLoading } =
    useAdminPublications({
      pageSize: 6,
      publicationStatusFilter: ['published'],
      rootLevelOnly: true,
      removeNotAllowedParents: true,
      include_publications: true,
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
      <Title
        variant="h2"
        mt="0px"
        ml={isSmallerThanPhone ? DEFAULT_PADDING : undefined}
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

Published.craft = {
  related: {
    settings: Settings,
  },
};

export const publishedTitle = messages.publishedTitle;

export default Published;
