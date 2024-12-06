import React from 'react';

import { Multiloc } from 'typings';

import { FinishedOrArchived as FinishedOrArchivedType } from 'api/projects_mini/types';
import useProjectsMini from 'api/projects_mini/useProjectsMini';

import useLocalize from 'hooks/useLocalize';

import EmptyState from '../_shared/EmptyState';
import ProjectCarrousel from '../_shared/ProjectCarrousel';

import messages from './messages';
import Settings from './Settings';

interface Props {
  titleMultiloc: Multiloc;
  filterBy: FinishedOrArchivedType['filter_by'];
}

const FinishedOrArchived = ({ titleMultiloc, filterBy }: Props) => {
  const localize = useLocalize();

  const { data, hasNextPage, fetchNextPage } = useProjectsMini({
    endpoint: 'finished_or_archived',
    filter_by: filterBy,
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
