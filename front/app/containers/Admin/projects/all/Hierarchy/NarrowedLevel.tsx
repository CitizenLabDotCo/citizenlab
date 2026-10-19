import React from 'react';

import useInfiniteProjectsMiniAdmin from 'api/projects_mini_admin/useInfiniteProjectsMiniAdmin';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';

import { PAGE_SIZE } from './constants';
import EmptyLevel from './EmptyLevel';
import useFilters from './Filters/useFilters';
import { Level, getProjectScope } from './level';
import LevelError from './LevelError';
import LevelSummary from './LevelSummary';
import LevelView from './LevelView';
import messages from './messages';
import { PathFrom } from './useProjectPath';
import useProjectSort from './useProjectSort';

const PATH_FROM: Record<Level['kind'], PathFrom | undefined> = {
  root: 'root',
  space: 'space',
  folder: undefined,
};

interface Props {
  level: Level;
}

// What a search or filter finds from this level down: the projects that
// match, each with where it sits, and how many there are out of all of them.
const NarrowedLevel = ({ level }: Props) => {
  const { formatMessage } = useIntl();
  const sort = useProjectSort();
  const { queryParams } = useFilters(level);
  const scope = getProjectScope(level);

  const matches = useInfiniteProjectsMiniAdmin(
    { ...queryParams, ...scope, sort },
    PAGE_SIZE
  );
  // Only its total is used. It takes the same page size as the levels, as the
  // page size isn't part of the query key: inside a folder, this is the
  // folder's own query.
  const all = useInfiniteProjectsMiniAdmin({ ...scope, sort }, PAGE_SIZE);

  const isLoading = matches.isLoading || all.isLoading;
  const isError = matches.isError || all.isError;
  const count = matches.data?.pages[0].meta.total ?? 0;
  const total = all.data?.pages[0].meta.total ?? 0;
  const summary = formatMessage(messages.shownOfTotal, { count, total });

  return (
    <>
      {/* Read out with each search or filter, as the results change under
      the field the user is in. It's there, empty, while the first results
      load: a status that appears with its text already in isn't read. */}
      <ScreenReaderOnly role="status" aria-live="polite">
        {!isLoading && !isError && summary}
      </ScreenReaderOnly>
      {isLoading ? null : isError ? (
        <LevelError />
      ) : count === 0 ? (
        <>
          <LevelSummary text={summary} />
          <EmptyLevel message={messages.noProjectsMatch} />
        </>
      ) : (
        <LevelView
          groups={[
            {
              kind: 'projects',
              count,
              // Matches from all over the level, not side by side.
              arrangeable: false,
              query: matches,
              pathFrom: PATH_FROM[level.kind],
            },
          ]}
          summary={summary}
        />
      )}
    </>
  );
};

export default NarrowedLevel;
