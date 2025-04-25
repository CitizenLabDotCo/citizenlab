import React, { useCallback, useMemo, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { ControlProps, RankedTester, rankWith } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { debounce } from 'lodash-es';
import { WrappedComponentProps } from 'react-intl';

import { useIdeaSelect } from 'containers/IdeasNewPage/SimilarInputs/InputSelectContext';
import SimilarIdeasList from 'containers/IdeasNewPage/SimilarInputs/SimilarInputsList';

import { FormLabel } from 'components/UI/FormComponents';
import QuillEditor from 'components/UI/QuillEditor';

import { injectIntl } from 'utils/cl-intl';
import {
  getLabel,
  sanitizeForClassname,
  getFieldNameFromPath,
} from 'utils/JSONFormUtils';

import ErrorDisplay from '../ErrorDisplay';

import { getSubtextElement } from './controlUtils';

const DescriptionControl = ({
  data,
  handleChange,
  path,
  errors,
  id,
  uischema,
  schema,
  required,
  visible,
}: ControlProps & WrappedComponentProps) => {
  const [didBlur, setDidBlur] = useState(false);
  const { setBody, showSimilarInputs } = useIdeaSelect();

  const debouncedSetBody = useMemo(
    () => debounce((val: string) => setBody(val), 400),
    [setBody]
  );

  const onChange = useCallback(
    (value: string) => {
      handleChange(path, value);
      if (showSimilarInputs) {
        debouncedSetBody(value);
      }
    },
    [handleChange, path, showSimilarInputs, debouncedSetBody]
  );

  if (!visible) {
    return null;
  }

  return (
    <Box id="e2e-idea-description-input">
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={getSubtextElement(uischema.options?.description)}
        subtextSupportsHtml
      />
      <QuillEditor
        id={sanitizeForClassname(id)}
        value={data}
        onChange={onChange}
        withCTAButton
        onBlur={() => setDidBlur(true)}
      />
      <ErrorDisplay
        inputId={sanitizeForClassname(id)}
        ajvErrors={errors}
        fieldPath={path}
        didBlur={didBlur}
      />
      {showSimilarInputs && <SimilarIdeasList />}
    </Box>
  );
};

export default withJsonFormsControlProps(injectIntl(DescriptionControl));

export const descriptionControlTester: RankedTester = rankWith(
  1000,
  (uischema) =>
    (uischema as any)?.scope
      ? getFieldNameFromPath((uischema as any)?.scope) === 'body_multiloc'
      : false
);
