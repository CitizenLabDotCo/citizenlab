import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';

import { Parameters } from 'api/projects_mini_admin/types';
import useInfiniteProjectsMiniAdmin from 'api/projects_mini_admin/useInfiniteProjectsMiniAdmin';

import { useIntl } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import { countActiveFilters } from './activeFilters';
import messages from './messages';
import { useParams } from './params';
import { getParticipationMethods } from './utils';

type CountParams = Omit<
  Parameters,
  'sort' | 'locale' | 'page[number]' | 'page[size]'
>;

// Sorting by creation date is the cheapest sort, and the order doesn't
// matter for counting.
const COUNT_SORT = 'recently_created_desc';

// The endpoint doesn't return a total count. With one project per page, the
// number of the last page is the number of projects.
const useProjectCount = (params: CountParams) => {
  const { data } = useInfiniteProjectsMiniAdmin(
    { ...params, sort: COUNT_SORT },
    1
  );

  const firstPage = data?.pages[0];
  if (!firstPage) return undefined;
  if (firstPage.data.length === 0) return 0;

  return getPageNumberFromUrl(firstPage.links.last) ?? undefined;
};

const ProjectCount = ({
  participation_methods,
  ...params
}: Partial<Parameters>) => {
  const { formatMessage } = useIntl();

  const filteredCount = useProjectCount({
    ...params,
    participation_methods: getParticipationMethods(participation_methods),
  });
  const totalCount = useProjectCount({});

  if (filteredCount === undefined || totalCount === undefined) return null;

  return (
    <Text
      m="0"
      fontSize="s"
      color="textSecondary"
      data-cy="projects-overview-filtered-project-count"
    >
      {formatMessage(messages.filteredProjectCount, {
        filteredCount,
        totalCount,
      })}
    </Text>
  );
};

/**
 * "x of y projects": how many projects match the filters, out of all the
 * projects the admin would see without them. Only shown (and fetched) while
 * filters are active.
 */
const FilteredProjectCount = () => {
  const { sort: _sort, ...params } = useParams();

  // The sort doesn't change which projects are shown, so it doesn't count
  // here. Projects and calendar share their filters.
  if (countActiveFilters(params, undefined) === 0) return null;

  return <ProjectCount {...params} />;
};

export default FilteredProjectCount;
