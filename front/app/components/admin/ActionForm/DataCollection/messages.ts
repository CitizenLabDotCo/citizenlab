import { defineMessages } from 'react-intl';

export default defineMessages({
  userDataCollection: {
    id: 'app.components.admin.ActionForm.DataCollection.userDataCollection',
    defaultMessage: 'User data collection',
  },
  userDataCollectionDescription_users: {
    id: 'app.components.admin.ActionForm.DataCollection.userDataCollectionDescription2',
    defaultMessage:
      'Personally identifiable information (e.g. name, email) and demographic data are associated with user profiles, where it has been provided by the user. You can choose to include or exclude the personally identifiable data in the survey results. You can also choose include or exclude demographic data in the survey results.',
  },
  includePersonalDataAndDemographics: {
    id: 'app.components.admin.ActionForm.DataCollection.includePersonalDataAndDemographics',
    defaultMessage:
      'Include personally identifiable data and demographics (recommended)',
  },
  excludePersonalDataButIncludeDemographics: {
    id: 'app.components.admin.ActionForm.DataCollection.excludePersonalDataButIncludeDemographics',
    defaultMessage:
      'Exclude personally identifiable data but include demographic data in the results',
  },
  excludePersonalDataAndDemographics: {
    id: 'app.components.admin.ActionForm.DataCollection.excludePersonalDataAndDemographics',
    defaultMessage:
      'Exclude both personally identifiable data and demographics from the results (full anonymity)',
  },
  tooltip: {
    id: 'app.components.admin.ActionForm.DataCollection.tooltip',
    defaultMessage:
      'For this option, registered users will not be able to retrieve their submitted response from their profile.',
  },
  demographicsOnlyWarning: {
    id: 'app.components.admin.ActionForm.DataCollection.demographicsOnlyWarning2',
    defaultMessage:
      'By selecting this option, you are choosing to not collect any personally identifiable information. You cannot recover this information later by changing this setting!',
  },
  anonymousWarning: {
    id: 'app.components.admin.ActionForm.DataCollection.anonymousWarning2',
    defaultMessage:
      'By selecting this option, you are choosing to not collect any personally identifiable information or demographic data. You cannot recover this information later by changing this setting!',
  },
});
