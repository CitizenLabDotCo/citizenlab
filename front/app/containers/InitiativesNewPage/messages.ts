import { defineMessages } from 'react-intl';

export default defineMessages({
  metaTitle1: {
    id: 'app.containers.InitiativesNewPage.metaTitle1',
    defaultMessage: 'Start a proposal | {orgName}',
  },
  metaDescription1: {
    id: 'app.containers.InitiativesNewPage.metaDescription1',
    defaultMessage:
      'Start your own proposal and make your voice heard by {orgName}',
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
