import { trackEventByName } from 'utils/analytics';
import clHistory from 'utils/cl-router/history';
import { stringify } from 'qs';

interface Params {
  lat?: number | null;
  lng?: number | null;
}

export const redirectToInitiativeForm =
  ({ lat, lng }: Params) =>
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
