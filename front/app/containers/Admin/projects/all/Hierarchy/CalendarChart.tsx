import React from 'react';

import useInfiniteProjectsMiniAdmin from 'api/projects_mini_admin/useInfiniteProjectsMiniAdmin';

import useLocalize from 'hooks/useLocalize';

import ProjectGanttChart from '../Calendar/ProjectGanttChart';
import toGanttItem from '../Calendar/toGanttItem';

import { PAGE_SIZE } from './constants';
import EmptyLevel from './EmptyLevel';
import useFilters from './Filters/useFilters';
import LoadMore from './Grid/LoadMore';
import { Level, getProjectScope } from './level';
import LevelError from './LevelError';
import messages from './messages';
import useProjectSort from './useProjectSort';

interface Props {
  level: Level;
}

// The calendar view: every project from this level down, search and filters
// applied, as bars over time. Spaces and folders aren't on it, so it can't
// be arranged.
const CalendarChart = ({ level }: Props) => {
  const localize = useLocalize();
  const sort = useProjectSort();
  const { queryParams, isNarrowed } = useFilters(level);
  const projects = useInfiniteProjectsMiniAdmin(
    { ...queryParams, ...getProjectScope(level), sort },
    PAGE_SIZE
  );

  if (projects.isLoading) return null;
  if (projects.isError) return <LevelError />;

  const loaded = projects.data?.pages.flatMap((page) => page.data) ?? [];
  if (loaded.length === 0) {
    return (
      <EmptyLevel message={isNarrowed ? messages.noProjectsMatch : undefined} />
    );
  }

  return (
    <>
      <ProjectGanttChart
        ganttItems={loaded.map((project) => toGanttItem(project, localize))}
        projectsById={Object.fromEntries(
          loaded.map((project) => [project.id, project])
        )}
      />
      <LoadMore
        hasNextPage={projects.hasNextPage}
        isFetchingNextPage={projects.isFetchingNextPage}
        fetchNextPage={projects.fetchNextPage}
      />
    </>
  );
};

export default CalendarChart;
