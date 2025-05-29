import React, { useCallback, useState, useMemo } from 'react';

import { Box, Input } from '@citizenlab/cl2-component-library';
import { ControlProps, RankedTester, rankWith } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { debounce } from 'lodash-es';

import { useIdeaSelect } from 'containers/IdeasNewPage/SimilarInputs/InputSelectContext';

import { FormLabel } from 'components/UI/FormComponents';

import { isString } from 'utils/helperUtils';
import {
  sanitizeForClassname,
  getFieldNameFromPath,
} from 'utils/JSONFormUtils';

import ErrorDisplay from '../ErrorDisplay';
import VerificationIcon from '../VerificationIcon';

import { getSubtextElement } from './controlUtils';

export const TitleControl = ({
  data,
  handleChange,
  path,
  errors,
  schema,
  id,
  required,
  uischema,
  label,
  visible,
}: ControlProps) => {
  const [didBlur, setDidBlur] = useState(false);
  const { setTitle, showSimilarInputs } = useIdeaSelect();

  const debouncedSetTitle = useMemo(
    () => debounce((val: string) => setTitle(val), 400),
    [setTitle]
  );

  const onChange = useCallback(
    (value: string) => {
      handleChange(
        path,
        schema.type === 'number' && value ? parseInt(value, 10) : value
      );
      if (showSimilarInputs) {
        debouncedSetTitle(value);
      }
    },
    [handleChange, path, schema.type, showSimilarInputs, debouncedSetTitle]
  );

  if (!visible) {
    return null;
  }

  return (
    <Box id="title_multiloc">
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={label}
        optional={!required}
        subtextValue={getSubtextElement(uischema.options?.description)}
        subtextSupportsHtml
      />
      <Box display="flex" flexDirection="row">
        <Input
          data-testid="inputControl"
          id={sanitizeForClassname(id)}
          type={schema.type === 'number' ? 'number' : 'text'}
          value={data}
          onChange={onChange}
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          maxCharCount={schema?.maxLength}
          onBlur={() => {
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            uischema?.options?.transform === 'trim_on_blur' &&
              isString(data) &&
              onChange(data.trim());
            setDidBlur(true);
          }}
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          disabled={uischema?.options?.readonly}
        />
        {/* TODO: Fix this the next time the file is edited. */}
        {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
        <VerificationIcon show={uischema?.options?.verificationLocked} />
      </Box>
      <ErrorDisplay
        inputId={sanitizeForClassname(id)}
        ajvErrors={errors}
        fieldPath={path}
        didBlur={didBlur}
      />
      {/* {showSimilarInputs && <SimilarIdeasList />} */}
    </Box>
  );
};

export default withJsonFormsControlProps(TitleControl);

export const titleControlTester: RankedTester = rankWith(1000, (uischema) =>
  (uischema as any)?.scope
    ? getFieldNameFromPath((uischema as any)?.scope) === 'title_multiloc'
    : false
);
