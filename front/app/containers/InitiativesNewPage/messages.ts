import { defineMessages } from 'react-intl';

export default defineMessages({
  metaTitle: {
    id: 'app.containers.InitiativesNewPage.metaTitle',
    defaultMessage: 'Start an Initiative • {orgName}',
  },
  metaDescription: {
    id: 'app.containers.InitiativesNewPage.metaDescription',
    defaultMessage:
      'Start your own initiative and make your voice heard by {orgName}',
  },
  locationNotFound: {
    id: 'app.containers.InitiativesNewPage.locationNotFound',
    defaultMessage:
      "We couldn't find an approximate address for the location you selected. You can confirm as is to save this location or type in an address to change it.",
  },
  unkownAddress: {
    id: 'app.containers.InitiativesNewPage.unkownAddress',
    defaultMessage: 'Unknown address',
  },
});
