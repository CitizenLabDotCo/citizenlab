import React, { memo, ReactElement, useCallback, useState } from 'react';
import { JsonForms } from '@jsonforms/react';

import CLCategoryLayout, { clCategoryTester } from './CLCategoryLayout';
import InputControl, { inputControlTester } from './InputControl';
import TextAreaControl, { textAreaControlTester } from './TextAreaControl';
import WYSIWYGControl, { WYSIWYGControlTester } from './WYSIWYGControl';
import TopicsControl, { topicsControlTester } from './TopicsControl';
import ImageControl, { imageControlTester } from './ImageControl';

import AttachmentsControl, {
  attachmentsControlTester,
} from './AttachmentsControl';

import {
  createAjv,
  JsonSchema7,
  UISchemaElement,
  isCategorization,
  Translator,
} from '@jsonforms/core';
import styled from 'styled-components';
import SingleSelectControl, {
  singleSelectControlTester,
} from './SingleSelectControl';
import MultiSelectControl, {
  multiSelectControlTester,
} from './MultiSelectControl';
import UserPickerControl, {
  userPickerControlTester,
} from './UserPickerControl';
import OrderedLayout, { orderedLayoutTester } from './OrderedLayout';
import CheckboxControl, { checkboxControlTester } from './CheckboxControl';
import LocationControl, { locationControlTester } from './LocationControl';
import DateControl, { dateControlTester } from './DateControl';

import {
  Box,
  fontSizes,
  media,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import ButtonBar from './ButtonBar';

import useObserveEvent from 'hooks/useObserveEvent';

import { CLErrors, Message } from 'typings';
import MultilocInputLayout, {
  multilocInputTester,
} from './MultilocInputLayout';
import { getDefaultAjvErrorMessage } from 'utils/errorUtils';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { ErrorObject } from 'ajv';
import { forOwn } from 'lodash-es';
import { APIErrorsContext, FormContext } from './contexts';

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

type FormData = Record<string, any> | null | undefined;

const customAjv = createAjv({ useDefaults: 'empty', removeAdditional: true });

export type AjvErrorGetter = (
  error: ErrorObject,
  uischema?: UISchemaElement
) => Message | undefined;

export type ApiErrorGetter = (
  errorKey: string,
  fieldName: string
) => Message | undefined;

export const InputIdContext = React.createContext<string | undefined>(
  undefined
);

interface Props {
  schema: JsonSchema7;
  uiSchema: UISchemaElement;
  onSubmit: (formData: FormData) => Promise<any>;
  initialFormData?: any;
  title?: ReactElement;
  /** The event name on which the form should automatically submit, as received from the eventEmitter. If this is set, no submit button is displayed. */
  submitOnEvent?: string;
  /** A function that returns a translation message given the fieldname and the error key returned by the API */
  getApiErrorMessage?: ApiErrorGetter;
  /** A function that returns a translation message for json-schema originating errors, given tje Ajv error object */
  getAjvErrorMessage: AjvErrorGetter;
  /**
   * If you use this as a controlled form, you'll lose some extra validation and transformations as defined in the handleSubmit.
   */
  onChange?: (formData: FormData) => void;
  /**
   * Idea id for update form, used to load and udpate image and files.
   */
  inputId?: string;
}
const renderers = [
  { tester: inputControlTester, renderer: InputControl },
  { tester: textAreaControlTester, renderer: TextAreaControl },
  { tester: checkboxControlTester, renderer: CheckboxControl },
  { tester: singleSelectControlTester, renderer: SingleSelectControl },
  { tester: multiSelectControlTester, renderer: MultiSelectControl },
  { tester: WYSIWYGControlTester, renderer: WYSIWYGControl },
  { tester: topicsControlTester, renderer: TopicsControl },
  { tester: imageControlTester, renderer: ImageControl },
  { tester: attachmentsControlTester, renderer: AttachmentsControl },
  { tester: clCategoryTester, renderer: CLCategoryLayout },
  { tester: orderedLayoutTester, renderer: OrderedLayout },
  { tester: locationControlTester, renderer: LocationControl },
  { tester: dateControlTester, renderer: DateControl },
  { tester: userPickerControlTester, renderer: UserPickerControl },
  { tester: multilocInputTester, renderer: MultilocInputLayout },
  { tester: clCategoryTester, renderer: CLCategoryLayout },
  { tester: orderedLayoutTester, renderer: OrderedLayout },
];

const Form = memo(
  ({
    schema,
    uiSchema,
    initialFormData,
    onSubmit,
    title,
    inputId,
    submitOnEvent,
    onChange,
    getAjvErrorMessage,
    getApiErrorMessage,
    intl: { formatMessage },
  }: Props & InjectedIntlProps) => {
    const [data, setData] = useState<FormData>(initialFormData);
    const [apiErrors, setApiErrors] = useState<CLErrors | undefined>();
    const [loading, setLoading] = useState(false);
    const [showAllErrors, setShowAllErrors] = useState(false);
    const safeApiErrorMessages = useCallback(
      () => (getApiErrorMessage ? getApiErrorMessage : () => undefined),
      [getApiErrorMessage]
    );

    const handleSubmit = async () => {
      const sanitizedFormData = {};
      forOwn(data, (value, key) => {
        sanitizedFormData[key] =
          value === null || value === '' || value === false ? undefined : value;
      });
      setData(sanitizedFormData);
      onChange?.(sanitizedFormData);
      setShowAllErrors(true);
      if (customAjv.validate(schema, sanitizedFormData)) {
        setLoading(true);
        try {
          await onSubmit(data as FormData);
        } catch (e) {
          setApiErrors(e.json.errors);
        }
        setLoading(false);
      }
    };

    useObserveEvent(submitOnEvent, handleSubmit);

    const translateError = useCallback(
      (
        error: ErrorObject,
        _translate: Translator,
        uischema?: UISchemaElement
      ) => {
        const message =
          getAjvErrorMessage?.(error, uischema) ||
          getDefaultAjvErrorMessage({
            keyword: error.keyword,
            format: error?.parentSchema?.format,
            type: error?.parentSchema?.type,
          });
        return formatMessage(message, error.params);
      },
      [formatMessage, getAjvErrorMessage]
    );

    const layoutTpye = isCategorization(uiSchema) ? 'fullpage' : 'inline';
    return (
      <Box
        as="form"
        height="100%"
        display="flex"
        flexDirection="column"
        maxHeight={
          layoutTpye === 'inline'
            ? 'auto'
            : `calc(100vh - ${stylingConsts.menuHeight}px)`
        }
        id={uiSchema?.options?.formId}
      >
        <Box overflow={layoutTpye === 'inline' ? 'visible' : 'auto'} flex="1">
          {title && <Title>{title}</Title>}
          <APIErrorsContext.Provider value={apiErrors}>
            <FormContext.Provider
              value={{
                showAllErrors,
                inputId,
                getApiErrorMessage: safeApiErrorMessages(),
              }}
            >
              <JsonForms
                schema={schema}
                uischema={uiSchema}
                data={data}
                renderers={renderers}
                onChange={({ data }) => {
                  setData(data);
                  onChange?.(data);
                }}
                validationMode="ValidateAndShow"
                ajv={customAjv}
                i18n={{
                  translateError,
                }}
              />
            </FormContext.Provider>
          </APIErrorsContext.Provider>
        </Box>
        {layoutTpye === 'fullpage' ? (
          <ButtonBar
            onSubmit={handleSubmit}
            apiErrors={Boolean(
              apiErrors?.values?.length && apiErrors?.values?.length > 0
            )}
            processing={loading}
            valid={!customAjv.errors || customAjv.errors?.length === 0}
          />
        ) : submitOnEvent ? (
          <InvisibleSubmitButton onClick={handleSubmit} />
        ) : (
          <Button onClick={handleSubmit}>Button</Button>
        )}
      </Box>
    );
  }
);

export default injectIntl(Form);
