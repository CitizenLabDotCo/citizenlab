import { defineMessages } from 'react-intl';

export default defineMessages({
  anyoneIntro: {
    id: 'app.components.formBuilder.nativeSurvey.accessRightsNotice.anyoneIntro',
    defaultMessage:
      'This survey is set to allow access for "Anyone" under the Access Rights tab.',
  },
  anyoneBullet1: {
    id: 'app.components.formBuilder.nativeSurvey.accessRightsNotice.anyoneBullet1',
    defaultMessage:
      'Survey respondents will not be required to sign up or log in to submit survey answers, which may result in duplicate submissions',
  },
  anyoneBullet2: {
    id: 'app.components.formBuilder.nativeSurvey.accessRightsNotice.anyoneBullet2',
    defaultMessage:
      'By skipping the sign up/log in step, you accept not to collect demographic information on survey respondents, which may impact your data analysis capabilities',
  },
  anyoneOutro: {
    id: 'app.components.formBuilder.nativeSurvey.accessRightsNotice.anyoneOutro2',
    defaultMessage:
      'If you wish to change this, you can do so in the {accessRightsSettingsLink}',
  },
  userFieldsIntro: {
    id: 'app.components.formBuilder.nativeSurvey.accessRightsNotice.userFieldsIntro',
    defaultMessage:
      'You are asking the following demographic questions of survey respondents through the sign up/log in step.',
  },
  userFieldsOutro: {
    id: 'app.components.formBuilder.nativeSurvey.accessRightsNotice.userFieldsOutro2',
    defaultMessage:
      'To streamline the collection of demographic information and ensure its integration into your user database, we advise incorporating any demographic questions directly into the sign-up/log-in process. To do so, please use the {accessRightsSettingsLink}',
  },
  accessRightsSettings: {
    id: 'app.components.formBuilder.nativeSurvey.accessRightsNotice.accessRightsSettings',
    defaultMessage: 'access rights settings for this phase.',
  },
});
