import React from 'react';

import { Multiloc } from 'typings';

import { FinishedOrArchived as FinishedOrArchivedType } from 'api/projects_mini/types';
import useProjectsMini from 'api/projects_mini/useProjectsMini';

import useLocalize from 'hooks/useLocalize';

import EmptyState from '../_shared/EmptyState';
import ProjectCarrousel from '../_shared/ProjectCarrousel';
import Skeleton from '../_shared/ProjectCarrousel/Skeleton';

import messages from './messages';
import Settings from './Settings';

interface Props {
  titleMultiloc: Multiloc;
  filterBy: FinishedOrArchivedType['filter_by'];
}

const FinishedOrArchived = ({ titleMultiloc, filterBy }: Props) => {
  const localize = useLocalize();

  const { data, hasNextPage, fetchNextPage, isInitialLoading } =
    useProjectsMini({
      endpoint: 'finished_or_archived',
      filter_by: filterBy,
    });

  const projects = data?.pages.map((page) => page.data).flat();
  const title = localize(titleMultiloc);

  if (isInitialLoading) {
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
      className="e2e-finished-or-archived"
      onLoadMore={fetchNextPage}
    />
  );
};

FinishedOrArchived.craft = {
  related: {
    settings: Settings,
  },
};

export const finishedOrArchivedTitle = messages.finishedOrArchivedTitle;

export default FinishedOrArchived;
