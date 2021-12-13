import React, { memo, useState } from 'react';
import { JsonForms } from '@jsonforms/react';
import { Box } from 'cl2-component-library';
import MultilocInputLayout, {
  multilocInputTester,
} from './MultilocInputLayout';
import InputControl, { inputControlTester } from './InputControl';
import CLCategoryLayout, { clCategoryTester } from './CLCategoryLayout';
import WYSIWYGControl, { WYSIWYGControlTester } from './WYSIWYGControl';
import TopicsControl, { topicsControlTester } from './TopicsControl';
import ImageControl, { imageControlTester } from './ImageControl';
import AttachmentsControl, {
  attachmentsControlTester,
} from './AttachmentsControl';
import Button from 'components/UI/Button';
import ajv from 'ajv';
import ButtonBar from './ButtonBar';
import { isError } from 'utils/helperUtils';

import { createAjv } from '@jsonforms/core';
import LocationControl, { locationControlTester } from './LocationControl';

const customAjv = createAjv();

interface Props {
  schema: any;
  uiSchema: any;
  onSubmit: (formData) => Promise<any>;
  initialFormData?: any;
}
const renderers = [
  { tester: multilocInputTester, renderer: MultilocInputLayout },
  { tester: inputControlTester, renderer: InputControl },
  { tester: WYSIWYGControlTester, renderer: WYSIWYGControl },
  { tester: topicsControlTester, renderer: TopicsControl },
  { tester: imageControlTester, renderer: ImageControl },
  { tester: attachmentsControlTester, renderer: AttachmentsControl },
  { tester: clCategoryTester, renderer: CLCategoryLayout },
  { tester: locationControlTester, renderer: LocationControl },
];

export default memo(
  ({ schema, uiSchema, initialFormData, onSubmit }: Props) => {
    const [data, setData] = useState(initialFormData);
    const [errors, setErrors] = useState<ajv.ErrorObject[]>();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
      if (!errors || (!isError(errors) && errors.length === 0)) {
        setLoading(true);
        try {
          await onSubmit(data);
        } catch (e) {
          console.log(e);
        }
        setLoading(false);
      }
    };

    return (
      <Box as="form">
        <JsonForms
          schema={schema}
          uischema={uiSchema}
          data={data}
          renderers={renderers}
          onChange={({ data, errors }) => {
            setData(data);
            setErrors(errors);
          }}
          validationMode="ValidateAndShow"
          ajv={customAjv}
        />
        {uiSchema?.options?.submit === 'ButtonBar' ? (
          <ButtonBar
            onSubmit={handleSubmit}
            // submitError={isError(errors)}
            processing={loading}
            formId={uiSchema?.options?.formId}
            valid={errors?.length === 0}
          />
        ) : (
          <Button onClick={handleSubmit}>Button</Button>
        )}
      </Box>
    );
  }
);
