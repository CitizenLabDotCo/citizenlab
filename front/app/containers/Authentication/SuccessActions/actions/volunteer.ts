import causeKeys from 'api/causes/keys';
import { ICauseData } from 'api/causes/types';
import { addVolunteer } from 'api/causes/useAddVolunteer';
import { deleteVolunteer } from 'api/causes/useDeleteVolunteer';

import { queryClient } from 'utils/cl-react-query/queryClient';

export interface VolunteerParams {
  cause: ICauseData;
}

export const volunteer =
  ({ cause }: VolunteerParams) =>
  async () => {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (cause.relationships?.user_volunteer?.data) {
      await deleteVolunteer({
        causeId: cause.id,
        volunteerId: cause.relationships.user_volunteer.data.id,
      });
    } else {
      await addVolunteer(cause.id);
    }

    queryClient.invalidateQueries({
      queryKey: causeKeys.lists(),
    });
    queryClient.invalidateQueries({
      queryKey: causeKeys.item({ id: cause.id }),
    });
  };
