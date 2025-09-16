import { MessageDescriptor } from 'react-intl';

import { UserFieldsInFormExplanation } from 'api/phases/types';

import messages from './messages';

export const EXPLANATION_MESSAGES: Record<
  UserFieldsInFormExplanation,
  MessageDescriptor
> = {
  user_fields_in_survey_not_supported_for_participation_method:
    messages.user_fields_in_survey_not_supported_for_participation_method,
  with_these_settings_cannot_ask_demographic_fields:
    messages.with_these_settings_cannot_ask_demographic_fields,
  cannot_ask_demographic_fields_in_registration_flow_when_permitted_by_is_everyone:
    messages.cannot_ask_demographic_fields_in_registration_flow_when_permitted_by_is_everyone,
  with_these_settings_can_only_ask_demographic_fields_in_registration_flow:
    messages.with_these_settings_can_only_ask_demographic_fields_in_registration_flow,
};
