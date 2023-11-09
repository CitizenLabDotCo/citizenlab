// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from 'components/IdeaButton/tracks';

// history
import clHistory from 'utils/cl-router/history';
import { stringify } from 'qs';

// typings
import { LatLng } from 'leaflet';
import { IUser, IUserData } from 'api/users/types';

// api
import { fetchProjectBySlug } from 'api/projects/useProjectBySlug';

// utils
import { getIdeaPostingRules } from 'utils/actionTakingRules';

export interface RedirectToIdeaFormParams {
  projectSlug: string;
  latLng?: LatLng | null;
  authUser?: IUser;
}

export const redirectToIdeaForm =
  ({ projectSlug, latLng }: RedirectToIdeaFormParams) =>
  async (authUser: IUserData) => {
    // TODO: Remove this temporary handling of postingLimitedMaxReached
    // Note: Our Requirements endpoint doesn't handle permissions/disabled reasons yet,
    // and the effort to add them in is too large at this time. So we're temporarily
    // handling this case here.
    const { data: project } = await fetchProjectBySlug({ slug: projectSlug });

    const { disabledReason } = getIdeaPostingRules({
      project,
      phase: undefined,
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
          },
          { addQueryPrefix: true }
        ),
      });
    }
  };
