import React from 'react';

import { MessageDescriptor } from 'react-intl';

import {
  ProjectDocumentAnnotationDisabledReason,
  IProjectData,
} from 'api/projects/types';

import globalMessages from 'utils/messages';

import ParticipationPermission from '../ParticipationPermission';

import Konveio from './Konveio';
import messages from './messages';

interface Props {
  project: IProjectData;
  phaseId: string | null;
  documentUrl: string;
}

const disabledMessages: {
  [key in ProjectDocumentAnnotationDisabledReason]: MessageDescriptor;
} = {
  project_inactive: messages.documentAnnotationDisabledProjectInactive,
  project_not_visible: messages.documentAnnotationDisabledNotPermitted,
  user_not_active: messages.documentAnnotationDisabledNotActiveUser,
  user_not_verified: messages.documentAnnotationDisabledNotVerified,
  user_missing_requirements: messages.documentAnnotationDisabledNotActiveUser,
  user_not_signed_in: messages.documentAnnotationDisabledMaybeNotPermitted,
  user_not_in_group: globalMessages.notInGroup,
  user_not_permitted: messages.documentAnnotationDisabledNotPermitted,
  not_document_annotation: messages.documentAnnotationDisabledNotActivePhase,
};

const isEnabled = (
  disabledReason: ProjectDocumentAnnotationDisabledReason | null
) => {
  const reasonsToHideDocument: ProjectDocumentAnnotationDisabledReason[] = [
    'project_inactive',
    'user_not_in_group',
    'user_not_permitted',
    'not_document_annotation',
  ];

  if (
    disabledReason !== null &&
    reasonsToHideDocument.includes(disabledReason)
  ) {
    return false;
  }

  return true;
};

const DocumentAnnotation = ({ project, phaseId, documentUrl }: Props) => {
  const { enabled: _enabled, disabled_reason } =
    project.attributes.action_descriptors.annotating_document;

  if (documentUrl) {
    return (
      <ParticipationPermission
        id="document-annotation"
        action="annotating_document"
        enabled={isEnabled(disabled_reason)}
        phaseId={phaseId}
        disabledMessage={
          disabled_reason ? disabledMessages[disabled_reason] : null
        }
      >
        <Konveio documentUrl={documentUrl} />
      </ParticipationPermission>
    );
  }

  return null;
};

export default DocumentAnnotation;
