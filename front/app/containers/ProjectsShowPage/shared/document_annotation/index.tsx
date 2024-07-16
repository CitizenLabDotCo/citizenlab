import React from 'react';

import { IProjectData } from 'api/projects/types';

import { getPermissionsDisabledMessage } from 'utils/actionDescriptors';
import { ProjectDocumentAnnotationDisabledReason } from 'utils/actionDescriptors/types';

import ParticipationPermission from '../ParticipationPermission';

import Konveio from './Konveio';

interface Props {
  project: IProjectData;
  phaseId: string | null;
  documentUrl: string;
}

const isEnabled = (
  disabledReason: ProjectDocumentAnnotationDisabledReason | null
) => {
  const reasonsToHideDocument: ProjectDocumentAnnotationDisabledReason[] = [
    'project_inactive',
    'user_not_in_group',
    'user_not_permitted',
    'not_document_annotation',
  ];

  return !(
    disabledReason !== null && reasonsToHideDocument.includes(disabledReason)
  );
};

const DocumentAnnotation = ({ project, phaseId, documentUrl }: Props) => {
  const disabledReason =
    project.attributes.action_descriptors.annotating_document.disabled_reason;

  const disabledMessage =
    getPermissionsDisabledMessage('annotating_document', disabledReason) ||
    null;

  if (documentUrl) {
    return (
      <ParticipationPermission
        id="document-annotation"
        action="annotating_document"
        enabled={isEnabled(disabledReason)}
        phaseId={phaseId}
        disabledMessage={disabledMessage}
      >
        <Konveio documentUrl={documentUrl} />
      </ParticipationPermission>
    );
  }

  return null;
};

export default DocumentAnnotation;
