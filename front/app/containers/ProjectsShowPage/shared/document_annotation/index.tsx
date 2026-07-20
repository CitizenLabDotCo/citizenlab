import React from 'react';

import { IPhaseData } from 'api/phases/types';
import { getPhaseActionDescriptor } from 'api/phases/utils';

import { getPermissionsDisabledMessage } from 'utils/actionDescriptors';
import { PhaseDocumentAnnotationDisabledReason } from 'utils/actionDescriptors/types';

import ParticipationPermission from '../ParticipationPermission';

import Konveio from './Konveio';

interface Props {
  phase: IPhaseData;
  documentUrl: string;
}

const isEnabled = (
  disabledReason: PhaseDocumentAnnotationDisabledReason | null
) => {
  const reasonsToHideDocument: PhaseDocumentAnnotationDisabledReason[] = [
    'project_inactive',
    'inactive_phase',
    'user_not_in_group',
    'user_not_permitted',
    'not_document_annotation',
  ];

  return !(
    disabledReason !== null && reasonsToHideDocument.includes(disabledReason)
  );
};

const DocumentAnnotation = ({ phase, documentUrl }: Props) => {
  const disabledReason = getPhaseActionDescriptor(
    phase,
    'annotating_document'
  ).disabled_reason;

  const disabledMessage =
    getPermissionsDisabledMessage('annotating_document', disabledReason) ||
    null;

  if (documentUrl) {
    return (
      <ParticipationPermission
        id="document-annotation"
        action="annotating_document"
        enabled={isEnabled(disabledReason)}
        phaseId={phase.id}
        disabledReason={disabledReason}
        disabledMessage={disabledMessage}
      >
        <Konveio documentUrl={documentUrl} />
      </ParticipationPermission>
    );
  }

  return null;
};

export default DocumentAnnotation;
