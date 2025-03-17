import React from 'react';

import { Title, useBreakpoint } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import useProjectsMini from 'api/projects_mini/useProjectsMini';

import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';

import { CarrouselContainer } from '../_shared/BaseCarrousel/Containers';
import EmptyState from '../_shared/EmptyState';
import ProjectCarrousel from '../_shared/ProjectCarrousel';
import useLocalizeWithFallback from '../_shared/useLocalizeWithFallback';

import messages from './messages';
import Settings from './Settings';

interface Props {
  titleMultiloc: Multiloc;
}

const FollowedItems = ({ titleMultiloc }: Props) => {
  const isSmallerThanPhone = useBreakpoint('phone');

  const localizeWithFallback = useLocalizeWithFallback();

  const { data, hasNextPage, fetchNextPage } = useProjectsMini({
    endpoint: 'for_followed_item',
  });
  const projects = data?.pages.map((page) => page.data).flat();
  const title = localizeWithFallback(titleMultiloc, messages.defaultTitle);

  if (!projects) return null;
  if (projects.length === 0) {
    return <EmptyState title={title} explanation={messages.noData} />;
  }

  return (
    <CarrouselContainer className="e2e-followed-items">
      <Title
        variant="h2"
        mt="0px"
        ml={isSmallerThanPhone ? DEFAULT_PADDING : undefined}
        color="tenantText"
      >
        {title}
      </Title>
      <ProjectCarrousel
        projects={projects}
        hasMore={!!hasNextPage}
        onLoadMore={fetchNextPage}
      />
    </CarrouselContainer>
  );
};

FollowedItems.craft = {
  related: {
    settings: Settings,
  },
};

export const followedItemsTitle = messages.followedItemsTitle;

export default FollowedItems;
