import { defineMessages } from 'react-intl';

export default defineMessages({
  fieldsEnabledMessage: {
    id: 'app.components.formBuilder.nativeSurvey.UserFieldsInFormNotice.fieldsEnabledMessage3',
    defaultMessage:
      "'Demographic fields in form' is enabled. When the form is displayed any configured demographic questions will be added on a new page immediately before the end of the form. These questions can be changed in the {accessRightsSettingsLink}.",
  },
  accessRightsSettings: {
    id: 'app.components.formBuilder.nativeSurvey.UserFieldsInFormNotice.accessRightsSettings',
    defaultMessage: 'access rights settings for this survey',
  },
});
