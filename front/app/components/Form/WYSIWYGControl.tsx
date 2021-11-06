import * as React from 'react';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { RankedTester, rankWith } from '@jsonforms/core';
import QuillEditor from 'components/UI/QuillEditor';
import { sanitizeForClassNames } from 'utils/helperUtils';

interface WYSIWYGControlProps {
  data: any;
  handleChange(path: string, value: any): void;
  path: string;
  errors: string;
}

const WYSIWYGControl = ({
  data,
  handleChange,
  path,
  errors,
}: WYSIWYGControlProps) => {
  errors && console.log('Errors in wysiwyg :', errors);
  return (
    <QuillEditor
      id={sanitizeForClassNames(path)}
      value={data}
      onChange={(value) => handleChange(path, value)}
      withCTAButton
    />
  );
};

export default withJsonFormsControlProps(WYSIWYGControl);

export const WYSIWYGControlTester: RankedTester = rankWith(
  1000,
  (schema) => schema?.['render'] === 'WYSIWYG'
);
