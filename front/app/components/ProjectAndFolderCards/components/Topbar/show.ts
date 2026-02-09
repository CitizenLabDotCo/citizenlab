import { IStatusCountsAll } from 'api/admin_publications_status_counts/types';
import { IAreaData } from 'api/areas/types';
import { IGlobalTopicData } from 'api/global_topics/types';

import { isNilOrError, NilOrError } from 'utils/helperUtils';

interface GetShowFiltersParams {
  isSmallerThanPhone: boolean;
  hasPublications: boolean;
  statusCounts: IStatusCountsAll;
  selectedTopics: string[];
  selectedAreas: string[];
}

export const getShowFilters = ({
  isSmallerThanPhone,
  hasPublications,
  statusCounts,
  selectedTopics,
  selectedAreas,
}: GetShowFiltersParams) => {
  if (selectedAreas.length > 0 || selectedTopics.length > 0) {
    return true;
  }

  return isSmallerThanPhone ? hasPublications : statusCounts.all > 0;
};

export const getShowFiltersLabel = (
  topics: IGlobalTopicData[] | NilOrError,
  areas: IAreaData[] | NilOrError,
  smallerThanTablet: boolean
) => {
  return (
    !(
      (isNilOrError(topics) || topics.length === 0) &&
      (isNilOrError(areas) || areas.length === 0)
    ) && !smallerThanTablet
  );
};
