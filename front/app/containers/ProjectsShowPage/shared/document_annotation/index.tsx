import React from 'react';

import { MessageDescriptor } from 'react-intl';

import {
  DocumentAnnotationDisabledReason,
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
  [key in DocumentAnnotationDisabledReason]: MessageDescriptor;
} = {
  project_inactive: messages.documentAnnotationDisabledProjectInactive,
  not_active: messages.documentAnnotationDisabledNotActiveUser,
  not_verified: messages.documentAnnotationDisabledNotVerified,
  missing_user_requirements: messages.documentAnnotationDisabledNotActiveUser,
  not_signed_in: messages.documentAnnotationDisabledMaybeNotPermitted,
  not_in_group: globalMessages.notInGroup,
  not_permitted: messages.documentAnnotationDisabledNotPermitted,
  not_document_annotation: messages.documentAnnotationDisabledNotActivePhase,
};

const isEnabled = (disabledReason: DocumentAnnotationDisabledReason | null) => {
  const reasonsToHideDocument: DocumentAnnotationDisabledReason[] = [
    'project_inactive',
    'not_in_group',
    'not_permitted',
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
    project.attributes.action_descriptor.annotating_document;

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
