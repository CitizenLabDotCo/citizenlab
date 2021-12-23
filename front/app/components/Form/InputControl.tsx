import { withJsonFormsControlProps } from '@jsonforms/react';
import { Input } from 'cl2-component-library';
import {
  ControlProps,
  isControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import React, { useContext, useState } from 'react';
import { APIErrorsContext, InputTermContext } from '.';
import { getFieldNameFromPath } from 'utils/JSONFormUtils';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import ErrorDisplay from './ErrorDisplay';

const InputControl = (props: ControlProps & InjectedIntlProps) => {
  const { data, handleChange, path, errors, schema } = props;
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
      <Input
        type="text"
        value={data}
        onChange={(value) => handleChange(path, value)}
        maxCharCount={schema?.maxLength}
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

export default withJsonFormsControlProps(injectIntl(InputControl));

export const inputControlTester: RankedTester = rankWith(3, isControl);
