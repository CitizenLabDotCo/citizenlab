// CL-3466 Add auth stuff
import React from 'react';
import Konveio from './Konveio';
import { MessageDescriptor } from 'react-intl';
import { DocumentAnnotationDisabledReason } from 'api/projects/types';
import messages from './messages';
import globalMessages from 'utils/messages';

interface Props {
  documentUrl: string;
  email: string | null;
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

const DocumentAnnotation = ({ documentUrl, email }: Props) => {
  return <Konveio documentUrl={documentUrl} email={email} />;
};

export default DocumentAnnotation;
