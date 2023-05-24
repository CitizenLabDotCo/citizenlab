// CL-3466 Add auth stuff
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
import useAuthUser from 'hooks/useAuthUser';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  documentUrl: string;
  project: IProjectData;
  phaseId: string | null;
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

const DocumentAnnotation = ({ documentUrl, project, phaseId }: Props) => {
  const authUser = useAuthUser();
  const email =
    !isNilOrError(authUser) && authUser.attributes.email
      ? authUser.attributes.email
      : null;
  const { enabled, disabled_reason } =
    project.attributes.action_descriptor.taking_survey;

  return (
    <ParticipationPermission
      projectId={project.id}
      action="annotating_document"
      enabled={enabled}
      phaseId={phaseId}
      disabledMessage={
        disabled_reason ? disabledMessages[disabled_reason] : null
      }
    >
      <Konveio documentUrl={documentUrl} email={email} />;
    </ParticipationPermission>
  );
};

export default DocumentAnnotation;
