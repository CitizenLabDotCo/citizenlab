import { defineMessages } from 'react-intl';

export default defineMessages({
  fieldsEnabledMessage: {
    id: 'app.components.formBuilder.nativeSurvey.UserFieldsInFormNotice.fieldsEnabledMessage',
    defaultMessage:
      "'User fields in survey form' is enabled. When the survey form is displayed any configured demographic questions will be added on a new page here. These questions can be changed in the {accessRightsSettingsLink}.",
  },
  accessRightsSettings: {
    id: 'app.components.formBuilder.nativeSurvey.UserFieldsInFormNotice.accessRightsSettings',
    defaultMessage: 'access rights settings for this survey',
  },
});
