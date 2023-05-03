import { trackEventByName } from 'utils/analytics';
import clHistory from 'utils/cl-router/history';
import { stringify } from 'qs';

export interface RedirectToInitiativeFormParams {
  lat?: number | null;
  lng?: number | null;
}

export const redirectToInitiativeForm =
  ({ lat, lng }: RedirectToInitiativeFormParams) =>
  async () => {
    trackEventByName('redirected to initiatives form');
    clHistory.push({
      pathname: `/initiatives/new`,
      search:
        lat && lng
          ? stringify({ lat, lng }, { addQueryPrefix: true })
          : undefined,
    });
  };
