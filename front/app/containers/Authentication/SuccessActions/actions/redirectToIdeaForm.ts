// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from 'components/IdeaButton/tracks';

// history
import clHistory from 'utils/cl-router/history';
import { stringify } from 'qs';

// typings
import { LatLng } from 'leaflet';

export interface RedirectToIdeaFormParams {
  projectSlug: string;
  latLng?: LatLng | null;
  phaseId?: string;
}

export const redirectToIdeaForm =
  ({ projectSlug, latLng, phaseId }: RedirectToIdeaFormParams) =>
  async () => {
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
  };
