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
  const localizedAreaTerm = settings?.area_term
    ? localize(settings.area_term)
    : '';
  // if localizedAreaTerm is an empty string, we want to use the default area term
  const areaTerm = localizedAreaTerm || formatMessage(messages.areaTerm);

  const localizedAreasTerm = settings?.areas_term
    ? localize(settings.areas_term)
    : '';
  // if localizedAreasTerm is an empty string, we want to use the default area term
  const areasTerm = localizedAreasTerm || formatMessage(messages.areasTerm);

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
