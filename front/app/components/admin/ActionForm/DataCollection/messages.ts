import { defineMessages } from 'react-intl';

export default defineMessages({
  userDataCollection: {
    id: 'app.components.admin.ActionForm.DataCollection.userDataCollection',
    defaultMessage: 'User data collection',
  },
  collectionDemographicsAndLinkUserAccount: {
    id: 'app.components.admin.ActionForm.DataCollection.collectionDemographicsAndLinkUserAccount',
    defaultMessage: 'collect demographics and link user account:',
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
