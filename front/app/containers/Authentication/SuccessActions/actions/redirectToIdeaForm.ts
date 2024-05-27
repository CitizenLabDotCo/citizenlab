import { stringify } from 'qs';

import { fetchPhase } from 'api/phases/usePhase';
import { fetchProjectBySlug } from 'api/projects/useProjectBySlug';
import { IUser, IUserData } from 'api/users/types';

import tracks from 'components/IdeaButton/tracks';

import { getIdeaPostingRules } from 'utils/actionTakingRules';
import { trackEventByName } from 'utils/analytics';
import clHistory from 'utils/cl-router/history';

export interface RedirectToIdeaFormParams {
  projectSlug: string;
  latLng?: GeoJSON.Point | null;
  phaseId?: string;
  authUser?: IUser;
}

export const redirectToIdeaForm =
  ({ projectSlug, latLng, phaseId }: RedirectToIdeaFormParams) =>
  async (authUser: IUserData) => {
    // TODO: Remove this temporary handling of postingLimitedMaxReached
    // Note: Our Requirements endpoint doesn't handle permissions/disabled reasons yet,
    // and the effort to add them in is too large at this time. So we're temporarily
    // handling this case here.
    const { data: project } = await fetchProjectBySlug({ slug: projectSlug });
    const { data: phase } = phaseId
      ? await fetchPhase({ phaseId })
      : { data: undefined };

    const { disabledReason } = getIdeaPostingRules({
      project,
      phase: phase || undefined,
      authUser,
    });

    if (disabledReason !== 'posting_limited_max_reached') {
      trackEventByName(tracks.redirectedToIdeaFrom);
      const positionParams = latLng
        ? { lat: latLng.coordinates[1], lng: latLng.coordinates[0] }
        : {};
      clHistory.push(
        {
          pathname: `/projects/${projectSlug}/ideas/new`,
          search: stringify(
            {
              ...positionParams,
              phase_id: phaseId,
            },
            { addQueryPrefix: true }
          ),
        },
        { scrollToTop: true }
      );
    }
  };
