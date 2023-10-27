// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from 'components/IdeaButton/tracks';

// history
import clHistory from 'utils/cl-router/history';
import { stringify } from 'qs';

// typings
import { LatLng } from 'leaflet';
import { fetchProjectBySlug } from 'api/projects/useProjectBySlug';
import { getIdeaPostingRules } from 'utils/actionTakingRules';
import { fetchPhase } from 'api/phases/usePhase';
import { IUser, IUserData } from 'api/users/types';

export interface RedirectToIdeaFormParams {
  projectSlug: string;
  latLng?: LatLng | null;
  phaseId?: string;
  authUser?: IUser;
}

export const redirectToIdeaForm =
  ({ projectSlug, latLng, phaseId }: RedirectToIdeaFormParams) =>
  async (authUser: IUserData) => {
    // Fetch latest project data to check if posting is enabled for new authUser
    const { data: project } = await fetchProjectBySlug({ slug: projectSlug });
    const { data: phase } = await fetchPhase({ phaseId });

    const { disabledReason } = getIdeaPostingRules({
      project,
      phase,
      authUser,
    });

    if (disabledReason !== 'postingLimitedMaxReached') {
      trackEventByName(tracks.redirectedToIdeaFrom);
      const positionParams = latLng ? { lat: latLng.lat, lng: latLng.lng } : {};
      clHistory.push({
        pathname: `/projects/${projectSlug}/ideas/new`,
        search: stringify(
          {
            ...positionParams,
            phase_id: phaseId,
          },
          { addQueryPrefix: true }
        ),
      });
    }
  };
