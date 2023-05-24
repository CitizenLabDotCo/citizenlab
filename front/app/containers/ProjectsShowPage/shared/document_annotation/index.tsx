// CL-3466 Add auth stuff
import React from 'react';
import Konveio from './Konveio';

interface Props {
  documentUrl: string;
  email: string | null;
}

const DocumentAnnotation = ({ documentUrl, email }: Props) => {
  return <Konveio documentUrl={documentUrl} email={email} />;
};

export default DocumentAnnotation;
