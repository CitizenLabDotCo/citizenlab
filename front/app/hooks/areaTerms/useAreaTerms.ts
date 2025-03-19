import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { coreSettings } from 'api/app_configuration/utils';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';
import { capitalize } from 'utils/textUtils';

import messages from './messages';

function useAreaTerms({ capitalized = false }: { capitalized?: boolean } = {}) {
  const { data: appConfig } = useAppConfiguration();
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const settings = appConfig ? coreSettings(appConfig.data) : null;
  const areaTerm = settings?.area_term
    ? localize(settings.area_term)
    : formatMessage(messages.areaTerm);
  const areasTerm = settings?.areas_term
    ? localize(settings.areas_term)
    : formatMessage(messages.areasTerm);

  return capitalized
    ? {
        areaTerm: capitalize(areaTerm),
        areasTerm: capitalize(areasTerm),
      }
    : {
        areaTerm,
        areasTerm,
      };
}

export default useAreaTerms;
