import { defineMessages } from 'react-intl';

export default defineMessages({
  user_fields_in_form_not_supported_for_action: {
    id: 'app.components.admin.ActionForm.Fields.user_fields_in_form_not_supported_for_action',
    defaultMessage:
      'Asking demographic questions as the last page of the form is not supported for this action.',
  },
  with_these_settings_cannot_ask_demographic_fields: {
    id: 'app.components.admin.ActionForm.Fields.with_these_settings_cannot_ask_demographic_fields2',
    defaultMessage:
      'Choosing how demographic questions are asked to participants is not applicable as you have disabled authentication and selected full anonymity',
  },
  cannot_ask_demographic_fields_in_registration_flow_when_permitted_by_is_everyone:
  {
    id: 'app.components.admin.ActionForm.Fields.cannot_ask_demographic_fields_in_registration_flow_when_permitted_by_is_everyone',
    defaultMessage:
      'When "Authentication" is set to "None", demographic questions can only be asked as the last page of the survey.',
  },
  with_these_settings_can_only_ask_demographic_fields_in_registration_flow: {
    id: 'app.components.admin.ActionForm.Fields.with_these_settings_can_only_ask_demographic_fields_in_registration_flow4',
    defaultMessage:
      'Because you selected "Full anonymity" in "User data collection", the answers to the demographic questions asked before participation WILL NOT BE STORED IN THE RESULTS. The answers will only be used to update the user\'s profile, but this profile is not linked to the response. To collect demographic data and store it in the results please choose another option under "User data collection".',
  },
  noDemographicQuestionsAsked: {
    id: 'app.components.admin.ActionForm.Fields.noDemographicQuestionsAsked',
    defaultMessage: 'No demographic questions asked.',
  },
});
