import { defineMessages } from 'react-intl';

export default defineMessages({
  userDataCollection: {
    id: 'app.components.admin.ActionForm.DataCollection.userDataCollection',
    defaultMessage: 'User data collection',
  },
  userDataCollectionDescription_users: {
    id: 'app.components.admin.ActionForm.DataCollection.userDataCollectionDescription',
    defaultMessage:
      'Personal information (e.g. name, email) and demographic data (see below) will always be saved to the user\'s profile. Here, you can choose if it should also be linked to survey responses. "Linking a response to a user account" means we store name and email of the person who filled out the survey. "Collecting demographics" means we store answers to demographic questions in the survey, and not just to the user profile.',
  },
  collectionDemographicsAndLinkUserAccount: {
    id: 'app.components.admin.ActionForm.DataCollection.collectionDemographicsAndLinkUserAccount1',
    defaultMessage: 'Collect demographics and link user account:',
  },
  collectAndLink1: {
    id: 'app.components.admin.ActionForm.DataCollection.collectAndLink1',
    defaultMessage:
      'collect demographics. Link response to user account if participant is logged in.',
  },
  collectAndLink2: {
    id: 'app.components.admin.ActionForm.DataCollection.collectAndLink2',
    defaultMessage: 'collect demographics. Link response to user account.',
  },
  demographicsOnly: {
    id: 'app.components.admin.ActionForm.DataCollection.demographicsOnly',
    defaultMessage: 'Demographics only:',
  },
  collectAndNotLink: {
    id: 'app.components.admin.ActionForm.DataCollection.collectAndNotLink',
    defaultMessage:
      'collect demographics. Responses will not be linked to user accounts.',
  },
  fullAnonymity: {
    id: 'app.components.admin.ActionForm.DataCollection.fullAnonymity',
    defaultMessage: 'Full anonymity:',
  },
  notCollectAndNotLink: {
    id: 'app.components.admin.ActionForm.DataCollection.notCollectAndNotLink',
    defaultMessage:
      'do not collect demographics. Responses will not be linked to user accounts.',
  },
});
