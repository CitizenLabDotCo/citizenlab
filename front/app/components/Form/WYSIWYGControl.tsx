import * as React from 'react';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { ControlProps, RankedTester, rankWith } from '@jsonforms/core';
import QuillEditor from 'components/UI/QuillEditor';
import { sanitizeForClassNames } from 'utils/helperUtils';
import { useState } from 'react';
import { InjectedIntlProps } from 'react-intl';
import ErrorDisplay from './ErrorDisplay';
import { injectIntl } from 'utils/cl-intl';

const WYSIWYGControl = ({
  data,
  handleChange,
  path,
  errors,
}: ControlProps & InjectedIntlProps) => {
  const [didBlur, setDidBlur] = useState(false);

  return (
    <>
      <QuillEditor
        id={sanitizeForClassNames(path)}
        value={data}
        onChange={(value) => handleChange(path, value)}
        withCTAButton
        onBlur={() => setDidBlur(true)}
      />
      <ErrorDisplay ajvErrors={didBlur ? errors : undefined} fieldPath={path} />
    </>
  );
};

export default withJsonFormsControlProps(injectIntl(WYSIWYGControl));

export const WYSIWYGControlTester: RankedTester = rankWith(
  1000,
  (schema) => schema?.['render'] === 'WYSIWYG'
);
