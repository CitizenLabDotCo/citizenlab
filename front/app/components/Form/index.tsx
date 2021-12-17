import React, { memo, ReactElement, useState } from 'react';
import { JsonForms } from '@jsonforms/react';
import { Box, fontSizes, media, stylingConsts } from 'cl2-component-library';
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
import styled from 'styled-components';

// hopefully we can standardize this someday
const Title = styled.h1`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.xxxxl}px;
  line-height: 40px;
  font-weight: 500;
  text-align: center;
  margin: 0;
  padding: 0;
  padding-top: 60px;
  padding-bottom: 40px;

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.xxxl}px;
    line-height: 34px;
  `}
`;
const customAjv = createAjv();

interface Props {
  schema: any;
  uiSchema: any;
  onSubmit: (formData) => Promise<any>;
  initialFormData?: any;
  title?: ReactElement;
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
  ({ schema, uiSchema, initialFormData, onSubmit, title }: Props) => {
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
      <Box
        as="form"
        height="100%"
        display="flex"
        flexDirection="column"
        maxHeight={`calc(100vh - ${stylingConsts.menuHeight}px)`}
      >
        <Box overflow="auto" flex="1">
          <Title>{title}</Title>
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
        </Box>
        {uiSchema?.options?.submit === 'ButtonBar' ? (
          <ButtonBar
            onSubmit={handleSubmit}
            errorsAmount={errors?.length || 0}
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
