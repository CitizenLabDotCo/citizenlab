import React, { memo, ReactElement, useState } from 'react';
import { JsonForms } from '@jsonforms/react';

import CLCategoryLayout, { clCategoryTester } from './CLCategoryLayout';
import InputControl, { inputControlTester } from './InputControl';
import WYSIWYGControl, { WYSIWYGControlTester } from './WYSIWYGControl';
import TopicsControl, { topicsControlTester } from './TopicsControl';
import ImageControl, { imageControlTester } from './ImageControl';
import AttachmentsControl, {
  attachmentsControlTester,
} from './AttachmentsControl';
import ajv from 'ajv';

import {
  createAjv,
  JsonSchema7,
  UISchemaElement,
  isCategorization,
} from '@jsonforms/core';
import { Locale } from 'typings';
import SingleSelectControl, {
  singleSelectControlTester,
} from './SingleSelectControl';
import MultiSelectControl, {
  multiSelectControlTester,
} from './MultiSelectControl';
import UserPickerControl, {
  userPickerControlTester,
} from './UserPickerControl';
import useLocale from 'hooks/useLocale';
import { isNilOrError } from 'utils/helperUtils';
import OrderedLayout, { orderedLayoutTester } from './OrderedLayout';
import CheckboxControl, { checkboxControlTester } from './CheckboxControl';
import LocationControl, { locationControlTester } from './LocationControl';
import DateControl, { dateControlTester } from './DateControl';

import { Box, fontSizes, media, stylingConsts } from 'cl2-component-library';
import styled from 'styled-components';
import Button from 'components/UI/Button';
import ButtonBar from './ButtonBar';

import useObserveEvent from 'hooks/useObserveEvent';

import { CLErrors } from 'typings';
import { InputTerm } from 'services/participationContexts';
import MultilocInputLayout, { multilocInputTester } from './MultilocInputLayout';

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

const InvisibleSubmitButton = styled.button`
  visibility: hidden;
`;

const customAjv = createAjv({ useDefaults: true });

export const APIErrorsContext = React.createContext<CLErrors | undefined>(
  undefined
);
export const InputTermContext = React.createContext<InputTerm>('idea');

interface Props {
  schemaMultiloc: { [key in Locale]?: JsonSchema7 };
  uiSchemaMultiloc: { [key in Locale]?: UISchemaElement };
  onSubmit: (formData: FormData) => Promise<any>;
  initialFormData?: any;
  title?: ReactElement;
  submitOnEvent?: string;
  onChange?: (FormData) => void;
}
const renderers = [
  { tester: inputControlTester, renderer: InputControl },
  { tester: checkboxControlTester, renderer: CheckboxControl },
  { tester: singleSelectControlTester, renderer: SingleSelectControl },
  { tester: multiSelectControlTester, renderer: MultiSelectControl },
  { tester: WYSIWYGControlTester, renderer: WYSIWYGControl },
  { tester: topicsControlTester, renderer: TopicsControl },
  { tester: imageControlTester, renderer: ImageControl },
  { tester: attachmentsControlTester, renderer: AttachmentsControl },
  { tester: locationControlTester, renderer: LocationControl },
  { tester: dateControlTester, renderer: DateControl },
  { tester: userPickerControlTester, renderer: UserPickerControl },
  { tester: multilocInputTester, renderer: MultilocInputLayout },
  { tester: clCategoryTester, renderer: CLCategoryLayout },
  { tester: orderedLayoutTester, renderer: OrderedLayout },
];

export default memo(
  ({
    schemaMultiloc,
    uiSchemaMultiloc,
    initialFormData,
    onSubmit,
    title,
    submitOnEvent,
    onChange,
  }: Props) => {
    const [data, setData] = useState(initialFormData);
    const [ajvErrors, setAjvErrors] = useState<ajv.ErrorObject[] | undefined>();
    const [apiErrors, setApiErrors] = useState<CLErrors | undefined>();
    const [loading, setLoading] = useState(false);
    const locale = useLocale();
    const uiSchema = !isNilOrError(locale) && uiSchemaMultiloc?.[locale];
    const schema = !isNilOrError(locale) && schemaMultiloc?.[locale];

    const handleSubmit = async () => {
      if (!ajvErrors || ajvErrors?.length === 0) {
        setLoading(true);
        try {
          await onSubmit(data);
        } catch (e) {
          setApiErrors(e.json.errors);
        }
        setLoading(false);
      }
    };

    submitOnEvent && useObserveEvent(submitOnEvent, handleSubmit);

    if (uiSchema && schema) {
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
            {title && <Title>{title}</Title>}
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

    return null;
  }
);
