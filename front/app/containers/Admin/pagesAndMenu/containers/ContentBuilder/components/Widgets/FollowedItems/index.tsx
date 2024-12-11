import React from 'react';

import { Multiloc } from 'typings';

import useAuthUser from 'api/me/useAuthUser';
import useProjectsMini from 'api/projects_mini/useProjectsMini';

import useLocalize from 'hooks/useLocalize';

import EmptyState from '../_shared/EmptyState';
import ProjectCarrousel from '../_shared/ProjectCarrousel';
import Skeleton from '../_shared/ProjectCarrousel/Skeleton';

import messages from './messages';
import Settings from './Settings';

interface Props {
  titleMultiloc: Multiloc;
}

const FollowedItems = ({ titleMultiloc }: Props) => {
  const localize = useLocalize();
  const { data: authUser } = useAuthUser();

  const { data, hasNextPage, fetchNextPage, isInitialLoading } =
    useProjectsMini({
      endpoint: 'for_followed_item',
    });
  const projects = data?.pages.map((page) => page.data).flat();
  const title = localize(titleMultiloc);

  if (isInitialLoading && !!authUser?.data) {
    return <Skeleton title={title} />;
  }

  if (!projects) return null;
  if (projects.length === 0) {
    return (
      <EmptyState titleMultiloc={titleMultiloc} explanation={messages.noData} />
    );
  }

  return (
    <ProjectCarrousel
      title={title}
      projects={projects}
      hasMore={!!hasNextPage}
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
