import React from 'react';
import Konveio from './Konveio';
import { MessageDescriptor } from 'react-intl';
import {
  DocumentAnnotationDisabledReason,
  IProjectData,
} from 'api/projects/types';
import messages from './messages';
import globalMessages from 'utils/messages';
import ParticipationPermission from '../ParticipationPermission';

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
  missing_data: messages.documentAnnotationDisabledNotActiveUser,
  not_signed_in: messages.documentAnnotationDisabledMaybeNotPermitted,
  not_in_group: globalMessages.notInGroup,
  not_permitted: messages.documentAnnotationDisabledNotPermitted,
  not_document_annotation: messages.documentAnnotationDisabledNotActivePhase,
};

const DocumentAnnotation = ({ project, phaseId, documentUrl }: Props) => {
  const { enabled: _enabled, disabled_reason } =
    project.attributes.action_descriptor.annotating_document;

  if (documentUrl) {
    return (
      <ParticipationPermission
        id="document-annotation"
        projectId={project.id}
        action="annotating_document"
        // We want to always show the document.
        // Konveio itself show a popup requesting
        // a sign up/in before commenting is possible.
        enabled={true}
        phaseId={phaseId}
        disabledMessage={
          disabled_reason ? disabledMessages[disabled_reason] : null
        }
      >
        <Konveio documentUrl={documentUrl} />;
      </ParticipationPermission>
    );
  }

  return null;
};

export default DocumentAnnotation;
