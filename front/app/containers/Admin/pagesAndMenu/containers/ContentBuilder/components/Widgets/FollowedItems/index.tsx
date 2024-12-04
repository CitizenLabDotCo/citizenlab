import React from 'react';

import { Multiloc } from 'typings';

import useProjectsMini from 'api/projects_mini/useProjectsMini';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import EmptyState from '../_shared/EmptyState';
import ProjectCarrousel from '../_shared/ProjectCarrousel';

import messages from './messages';
import Settings from './Settings';

interface Props {
  titleMultiloc: Multiloc;
}

const FollowedItems = ({ titleMultiloc }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { data, hasNextPage, fetchNextPage } = useProjectsMini({
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
      title={localize(titleMultiloc, {
        fallback: formatMessage(messages.defaultTitle),
      })}
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
