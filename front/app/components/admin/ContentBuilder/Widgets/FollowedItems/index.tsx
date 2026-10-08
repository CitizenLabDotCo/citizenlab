import React from 'react';

import { Multiloc } from 'typings';

import useProjectsMini from 'api/projects_mini/useProjectsMini';

import { CarrouselContainer } from 'components/admin/ContentBuilder/Widgets/_shared/BaseCarrousel/Containers';
import CarrouselTitle from 'components/admin/ContentBuilder/Widgets/_shared/CarrouselTitle';
import EmptyState from 'components/admin/ContentBuilder/Widgets/_shared/EmptyState';
import ProjectCarrousel from 'components/admin/ContentBuilder/Widgets/_shared/ProjectCarrousel';
import useLocalizeWithFallback from 'components/admin/ContentBuilder/Widgets/_shared/useLocalizeWithFallback';

import messages from './messages';
import Settings from './Settings';

interface Props {
  titleMultiloc: Multiloc;
}

const FollowedItems = ({ titleMultiloc }: Props) => {
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
      <CarrouselTitle>{title}</CarrouselTitle>
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
