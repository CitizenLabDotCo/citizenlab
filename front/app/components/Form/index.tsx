import React from 'react';

interface Props {
  schema: any;
  uiSchema: any;
  onSubmit: (formData) => void;
  initialFormData?: any;
}

export default ({}: Props) => {
  return <div> Hello Form </div>;
};
