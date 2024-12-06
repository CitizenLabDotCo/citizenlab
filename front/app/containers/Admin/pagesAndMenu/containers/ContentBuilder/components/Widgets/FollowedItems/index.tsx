import React from 'react';

import { Multiloc } from 'typings';

import useProjectsMini from 'api/projects_mini/useProjectsMini';

import useLocalize from 'hooks/useLocalize';

import EmptyState from '../_shared/EmptyState';
import ProjectCarrousel from '../_shared/ProjectCarrousel';

import messages from './messages';
import Settings from './Settings';

interface Props {
  titleMultiloc: Multiloc;
}

const FollowedItems = ({ titleMultiloc }: Props) => {
  const localize = useLocalize();
  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useProjectsMini({
      endpoint: 'for_followed_item',
    });
  const projects = data?.pages.map((page) => page.data).flat();

  if (!projects) return null;
  if (projects.length === 0) {
    return (
      <EmptyState titleMultiloc={titleMultiloc} explanation={messages.noData} />
    );
  }

  return (
    <ProjectCarrousel
      title={localize(titleMultiloc)}
      projects={projects}
      hasMore={!!hasNextPage}
      isLoadingMore={isFetchingNextPage}
      onLoadMore={fetchNextPage}
    />
  );
};

FollowedItems.craft = {
  related: {
    settings: Settings,
  },
};

export const followedItemsTitle = messages.followedItemsTitle;

export default FollowedItems;
