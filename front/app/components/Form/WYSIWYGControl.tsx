import * as React from 'react';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { ControlProps, RankedTester, rankWith } from '@jsonforms/core';
import QuillEditor from 'components/UI/QuillEditor';
import { sanitizeForClassNames } from 'utils/helperUtils';
import { useContext, useState } from 'react';
import { getFieldNameFromPath } from 'utils/JSONFormUtils';
import { APIErrorsContext, InputTermContext } from '.';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import ErrorDisplay from './ErrorDisplay';

const WYSIWYGControl = ({
  data,
  handleChange,
  path,
  errors,
}: ControlProps & InjectedIntlProps) => {
  const [didBlur, setDidBlur] = useState(false);
  const fieldName = getFieldNameFromPath(path);
  const inputTerm = useContext(InputTermContext);
  const allApiErrors = useContext(APIErrorsContext);
  const fieldErrors = [
    ...(allApiErrors?.[fieldName] || []),
    ...(allApiErrors?.base?.filter(
      (err) =>
        err.error === 'includes_banned_words' &&
        err?.blocked_words?.find((e) => e?.attribute === fieldName)
    ) || []),
  ];

  return (
    <>
      <QuillEditor
        id={sanitizeForClassNames(path)}
        value={data}
        onChange={(value) => handleChange(path, value)}
        withCTAButton
        hasError={!!((didBlur && errors) || fieldErrors)}
        onBlur={() => setDidBlur(true)}
      />
      <ErrorDisplay
        ajvErrors={didBlur ? errors : undefined}
        fieldName={fieldName}
        apiErrors={fieldErrors}
        inputTerm={inputTerm}
      />
    </>
  );
};

export default withJsonFormsControlProps(injectIntl(WYSIWYGControl));

export const WYSIWYGControlTester: RankedTester = rankWith(
  1000,
  (schema) => schema?.['render'] === 'WYSIWYG'
);
