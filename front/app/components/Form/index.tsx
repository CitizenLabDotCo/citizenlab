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

import {
  createAjv,
  JsonSchema7,
  UISchemaElement,
  isCategorization,
} from '@jsonforms/core';
import LocationControl, { locationControlTester } from './LocationControl';
import styled from 'styled-components';
import { CLErrors } from 'typings';
import { InputTerm } from 'services/participationContexts';
import UserPickerControl, {
  userPickerControlTester,
} from './UserPickerControl';

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
const customAjv = createAjv({ useDefaults: true });

export const APIErrorsContext = React.createContext<CLErrors | undefined>(
  undefined
);
export const InputTermContext = React.createContext<InputTerm>('idea');

export const InputIdContext = React.createContext<string | undefined>(
  undefined
);

interface Props {
  schema: JsonSchema7;
  uiSchema: UISchemaElement;
  onSubmit: (formData: FormData) => Promise<any>;
  initialFormData?: any;
  title?: ReactElement;
  inputId: string | undefined;
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
  { tester: userPickerControlTester, renderer: UserPickerControl },
];

export default memo(
  ({ schema, uiSchema, initialFormData, onSubmit, title, inputId }: Props) => {
    const [data, setData] = useState(initialFormData);
    const [ajvErrors, setAjvErrors] = useState<ajv.ErrorObject[] | undefined>();
    const [apiErrors, setApiErrors] = useState<CLErrors | undefined>();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
      if (ajvErrors?.length === 0) {
        setLoading(true);
        try {
          await onSubmit(data);
        } catch (e) {
          setApiErrors(e.json.errors);
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
        id={uiSchema?.options?.formId}
      >
        <Box overflow="auto" flex="1">
          <Title>{title}</Title>
          <InputIdContext.Provider value={inputId}>
            <APIErrorsContext.Provider value={apiErrors}>
              <InputTermContext.Provider value={uiSchema?.options?.inputTerm}>
                <JsonForms
                  schema={schema}
                  uischema={uiSchema}
                  data={data}
                  renderers={renderers}
                  onChange={({ data, errors }) => {
                    setData(data);
                    setAjvErrors(errors);
                  }}
                  validationMode="ValidateAndShow"
                  ajv={customAjv}
                />
              </InputTermContext.Provider>
            </APIErrorsContext.Provider>
          </InputIdContext.Provider>
        </Box>
        {isCategorization(uiSchema) ? ( // For now all categorizations are rendered as CLCategoryLayout (in the idea form)
          <ButtonBar
            onSubmit={handleSubmit}
            apiErrors={Boolean(
              apiErrors?.values?.length && apiErrors?.values?.length > 0
            )}
            processing={loading}
            valid={ajvErrors?.length === 0}
          />
        ) : (
          <Button onClick={handleSubmit}>Button</Button>
        )}
      </Box>
    );
  }
);
