// CL-3466 Add auth stuff
import React from 'react';
import Konveio from './Konveio';
import { MessageDescriptor } from 'react-intl';
import { DocumentAnnotationDisabledReason } from 'api/projects/types';
import messages from './messages';
import globalMessages from 'utils/messages';
import ParticipationPermission from '../ParticipationPermission';

interface Props {
  documentUrl: string;
  email: string | null;
  projectId: string;
  enabled: boolean;
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
  not_document_annotation:
    messages.documentAnnotationDisabledNotDocumentAnnotation,
};

const DocumentAnnotation = ({
  documentUrl,
  email,
  projectId,
  enabled,
}: Props) => {
  return (
    <ParticipationPermission
      projectId={projectId}
      action="annotating_document"
      enabled={enabled}
    >
      <Konveio documentUrl={documentUrl} email={email} />;
    </ParticipationPermission>
  );
};

export default DocumentAnnotation;
