import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { queryClient } from 'utils/cl-react-query/queryClient';
import moderationsKeys from 'api/moderations/keys';
import moderationsCountKeys from 'api/moderation_count/keys';

const apiEndpoint = `${API_PATH}/inappropriate_content_flags`;

export async function removeInappropriateContentFlag(flagId: string) {
  const response = streams.update(
    `${apiEndpoint}/${flagId}/mark_as_deleted`,
    flagId,
    {}
  );

  queryClient.invalidateQueries({
    queryKey: moderationsKeys.lists(),
  });
  queryClient.invalidateQueries({
    queryKey: moderationsCountKeys.items(),
  });

  return response;
}
