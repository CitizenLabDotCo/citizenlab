import { defineMessages } from 'react-intl';

export default defineMessages({
  fieldsEnabledMessage: {
    id: 'app.components.formBuilder.nativeSurvey.UserFieldsInFormNotice.fieldsEnabledMessage2',
    defaultMessage:
      "'Demographic fields in survey form' is enabled. When the survey form is displayed any configured demographic questions will be added on a new page immediately before the end of the survey. These questions can be changed in the {accessRightsSettingsLink}.",
  },
  accessRightsSettings: {
    id: 'app.components.formBuilder.nativeSurvey.UserFieldsInFormNotice.accessRightsSettings',
    defaultMessage: 'access rights settings for this survey',
  },
});
