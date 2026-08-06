import { defineMessages } from 'react-intl';

export default defineMessages({
  whoCanParticipate: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.whoCanParticipate',
    defaultMessage: 'Who can participate',
  },
  firstDecide: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.firstDecide',
    defaultMessage:
      'First decide whether an account is needed at all, then pick the proof of identity required.',
  },
  requireSignIn: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.requireSignIn',
    defaultMessage: 'Require sign-in',
  },
  mustProveIdentity: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.mustProveIdentity',
    defaultMessage: 'Must prove who they are first.',
  },
});
