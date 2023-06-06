import { defineMessages } from 'react-intl';

export default defineMessages({
  documentAnnotationDisabledProjectInactive: {
    id: 'app.containers.ProjectsShowPage.shared.document_annotation.documentAnnotationDisabledProjectInactive',
    defaultMessage:
      'The document is no longer available, since this project is no longer active.',
  },
  documentAnnotationDisabledNotPermitted: {
    id: 'app.containers.ProjectsShowPage.shared.document_annotation.documentAnnotationDisabledNotPermitted',
    defaultMessage:
      "Unfortunately, you don't have the rights to review this document.",
  },
  documentAnnotationDisabledMaybeNotPermitted: {
    id: 'app.containers.ProjectsShowPage.shared.document_annotation.documentAnnotationDisabledMaybeNotPermitted',
    defaultMessage:
      'Only certain users can review this document. Please {signUpLink} or {logInLink} first.',
  },
  documentAnnotationDisabledNotActiveUser: {
    id: 'app.containers.ProjectsShowPage.shared.document_annotation.documentAnnotationDisabledNotActiveUser',
    defaultMessage: 'Please {completeRegistrationLink} to review the document.',
  },
  documentAnnotationDisabledNotActivePhase: {
    id: 'app.containers.ProjectsShowPage.shared.document_annotation.documentAnnotationDisabledNotActivePhase1',
    defaultMessage:
      'This document can only be reviewed when this phase is active.',
  },
  documentAnnotationDisabledNotVerified: {
    id: 'app.containers.ProjectsShowPage.shared.document_annotation.documentAnnotationDisabledNotVerified',
    defaultMessage:
      'Reviewing this document requires verification of your account. {verificationLink}',
  },
});
