import { Multiloc, SupportedLocale } from 'typings';

import { IUpdatedPhaseProperties, ParticipationMethod } from 'api/phases/types';

import { MessageDescriptor } from 'utils/cl-intl';

import { defaultConfigForMethod } from './components/PhaseParticipationConfig/utils/participationMethodConfigs';
import messages from './messages';

type FormatMessageWithLocale = (
  locale: SupportedLocale,
  message: MessageDescriptor
) => string;

export const localizedDefaults = (
  message: MessageDescriptor,
  tenantLocales: SupportedLocale[],
  formatMessageWithLocale: FormatMessageWithLocale
): Multiloc =>
  tenantLocales.reduce<Multiloc>((acc, locale) => {
    acc[locale] = formatMessageWithLocale(locale, message);
    return acc;
  }, {});

interface Options {
  participationMethod: ParticipationMethod;
  standalone: boolean;
  tenantLocales: SupportedLocale[];
  formatMessageWithLocale: FormatMessageWithLocale;
}

// The backend requires a survey title and button text on native surveys but
// does not fill them in itself.
export const getNewPhaseDefaults = ({
  participationMethod,
  standalone,
  tenantLocales,
  formatMessageWithLocale,
}: Options): IUpdatedPhaseProperties => ({
  ...defaultConfigForMethod(participationMethod),
  ...(standalone && { placement_type: 'standalone' }),
  ...(participationMethod === 'native_survey' && {
    native_survey_title_multiloc: localizedDefaults(
      messages.defaultSurveyTitleLabel,
      tenantLocales,
      formatMessageWithLocale
    ),
    native_survey_button_multiloc: localizedDefaults(
      messages.defaultSurveyCTALabel,
      tenantLocales,
      formatMessageWithLocale
    ),
  }),
});
