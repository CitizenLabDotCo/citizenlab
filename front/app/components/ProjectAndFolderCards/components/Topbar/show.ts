import { IStatusCounts } from 'hooks/useAdminPublicationsStatusCounts';
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { ITopicData } from 'api/topics/types';
import { IAreaData } from 'services/areas';

interface GetShowFiltersParams {
  isSmallerThanPhone: boolean;
  hasPublications: boolean;
  statusCounts: IStatusCounts;
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
  topics: ITopicData[] | NilOrError,
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
