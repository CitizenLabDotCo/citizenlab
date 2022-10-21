import { IStatusCounts } from 'hooks/useAdminPublicationsStatusCounts';
import { IAreaData } from 'services/areas';
import { ITopicData } from 'services/topics';
import { isNilOrError, NilOrError } from 'utils/helperUtils';

interface GetShowFiltersParams {
  smallerThanXlPhone: boolean;
  hasPublications: boolean;
  statusCounts: IStatusCounts;
  selectedTopics: string[];
  selectedAreas: string[];
}

export const getShowFilters = ({
  smallerThanXlPhone,
  hasPublications,
  statusCounts,
  selectedTopics,
  selectedAreas,
}: GetShowFiltersParams) => {
  if (selectedAreas.length > 0 || selectedTopics.length > 0) {
    return true;
  }

  return smallerThanXlPhone ? hasPublications : statusCounts.all > 0;
};

export const getShowFiltersLabel = (
  topics: ITopicData[] | NilOrError,
  areas: IAreaData[] | NilOrError,
  smallerThanMinTablet: boolean
) => {
  return (
    !(
      (isNilOrError(topics) || topics.length === 0) &&
      (isNilOrError(areas) || areas.length === 0)
    ) && !smallerThanMinTablet
  );
};
