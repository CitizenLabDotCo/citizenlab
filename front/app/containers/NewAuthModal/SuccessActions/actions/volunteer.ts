import { ICauseData } from 'api/causes/types';
import { addVolunteer } from 'api/causes/useAddVolunteer';
import { deleteVolunteer } from 'api/causes/useDeleteVolunteer';

export interface VolunteerParams {
  cause: ICauseData;
}

export const volunteer =
  ({ cause }: VolunteerParams) =>
  async () => {
    if (cause.relationships?.user_volunteer?.data) {
      deleteVolunteer({
        causeId: cause.id,
        volunteerId: cause.relationships.user_volunteer.data.id,
      });
    } else {
      addVolunteer(cause.id);
    }
  };
