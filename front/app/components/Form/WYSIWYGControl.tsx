import * as React from 'react';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { RankedTester, rankWith } from '@jsonforms/core';
import QuillEditor from 'components/UI/QuillEditor';
import { sanitizeForClassNames } from 'utils/helperUtils';
import Error from 'components/UI/Error';
import { useState } from 'react';

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
  const [didBlur, setDidBlur] = useState(false);
  return (
    <>
      <QuillEditor
        id={sanitizeForClassNames(path)}
        value={data}
        onChange={(value) => handleChange(path, value)}
        withCTAButton
        hasError={didBlur && Boolean(errors)}
        onBlur={() => setDidBlur(true)}
      />
      {errors && didBlur && <Error text={errors} />}
    </>
  );
};

export default withJsonFormsControlProps(WYSIWYGControl);

export const WYSIWYGControlTester: RankedTester = rankWith(
  1000,
  (schema) => schema?.['render'] === 'WYSIWYG'
);
