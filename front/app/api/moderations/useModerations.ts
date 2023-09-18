import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import moderationsKeys from './keys';
import { IModerations, ModerationsKeys, InputParameters } from './types';

const fetchModerations = (filters: InputParameters) => {
  return fetcher<IModerations>({
    path: '/moderations',
    action: 'get',
    queryParams: {
      'page[number]': filters.pageNumber,
      'page[size]': filters.pageSize,
      moderation_status: filters.moderationStatus,
      moderatable_types: filters.moderatableTypes,
      project_ids: filters.projectIds,
      search: filters.searchTerm,
      is_flagged: filters.isFlagged,
    },
  });
};

const useModerations = (filters: InputParameters) => {
  return useQuery<IModerations, CLErrors, IModerations, ModerationsKeys>({
    queryKey: moderationsKeys.list(filters),
    queryFn: () => fetchModerations(filters),
  });
};

export default useModerations;
