import { defineMessages } from 'react-intl';

export default defineMessages({
  unavailablePasswordLogin: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.unavailablePasswordLogin',
    defaultMessage:
      'Unavailable: password login is turned off for this platform.',
  },
  unavailableSms: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.unavailableSms',
    defaultMessage: 'Unavailable: SMS is turned off for this platform.',
  },
  unavailableVerification: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.unavailableVerification',
    defaultMessage:
      'Unavailable: no identity verification method is configured.',
  },
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
})