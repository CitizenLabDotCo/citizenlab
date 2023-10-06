import React, {
  memo,
  ReactElement,
  useCallback,
  useState,
  useEffect,
} from 'react';
import { JsonForms } from '@jsonforms/react';

import {
  createAjv,
  JsonSchema7,
  UISchemaElement,
  isCategorization,
  Translator,
  Layout,
} from '@jsonforms/core';
import styled from 'styled-components';

import {
  Box,
  fontSizes,
  media,
  stylingConsts,
  useBreakpoint,
  Button,
} from '@citizenlab/cl2-component-library';
import ButtonBar from './Components/ButtonBar';

import useObserveEvent from 'hooks/useObserveEvent';

import { CLErrors } from 'typings';
import { getDefaultAjvErrorMessage } from 'utils/errorUtils';
import { useIntl, MessageDescriptor } from 'utils/cl-intl';
import { ErrorObject } from 'ajv';
import { forOwn } from 'lodash-es';
import { APIErrorsContext, FormContext } from './contexts';
import useLocale from 'hooks/useLocale';
import { isNilOrError } from 'utils/helperUtils';
import { selectRenderers } from './formConfig';
import { getFormSchemaAndData } from './utils';
import messages from './messages';

// hopefully we can standardize this someday
const Title = styled.h1`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.xxxxl}px;
  line-height: 40px;
  font-weight: 500;
  text-align: center;
  margin: 0;
  padding: 0;

  ${media.tablet`
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
) => MessageDescriptor | undefined;

export type ApiErrorGetter = (
  errorKey: string,
  fieldName: string
) => MessageDescriptor | undefined;

interface Props {
  schema: JsonSchema7;
  uiSchema: Layout;
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
  formSubmitText?: MessageDescriptor;
  config?: 'default' | 'input' | 'survey';
  layout?: 'inline' | 'fullpage';
  footer?: React.ReactNode;
}

const Form = memo(
  ({
    schema,
    uiSchema,
    initialFormData,
    onSubmit,
    title,
    inputId,
    formSubmitText,
    submitOnEvent,
    onChange,
    getAjvErrorMessage,
    getApiErrorMessage,
    config,
    layout,
    footer,
  }: Props) => {
    const { formatMessage } = useIntl();
    const [data, setData] = useState<FormData>(initialFormData);
    const [apiErrors, setApiErrors] = useState<CLErrors | undefined>();
    const [loading, setLoading] = useState(false);
    const [showAllErrors, setShowAllErrors] = useState(false);
    const [showSubmitButton, setShowSubmitButton] = useState(true);
    const safeApiErrorMessages = useCallback(
      () => (getApiErrorMessage ? getApiErrorMessage : () => undefined),
      [getApiErrorMessage]
    );
    const isSmallerThanPhone = useBreakpoint('phone');

    // To handle multilocs we had the two options of adding one control for each multiloc thing : InputMultiloc, WYSIWYGMultiloc, or have the top-level multiloc object be a custom layout that shows the appropriate field and render the controls inside normally. I went for the second option.
    // Both options limited somehow the validation power, and with this solution, it means that the errors on the layout level are not available (IE this field is required, or this field should have at least one property). So this is a hacky thing to make the current locale required, but we will have to find something better would we want to make all locales required like in the admin side or simply is we would want to have a cleaner form component.
    const [processingInitialMultiloc, setProcessingInitialMultiloc] =
      useState(true);
    const [fixedSchema, setSchema] = useState(schema);

    const locale = useLocale();

    // Hacky way of handling required multiloc fields
    useEffect(() => {
      if (
        !isNilOrError(locale) &&
        !isNilOrError(schema) &&
        processingInitialMultiloc
      ) {
        const requiredMultilocFields = schema?.required?.filter((req) =>
          req.endsWith('_multiloc')
        );
        // requiredMultilocFields can only have elements if schema.required's has, can cast type
        if (requiredMultilocFields && requiredMultilocFields.length > 0) {
          setSchema((schema) => {
            const requiredFieldsObject = Object.fromEntries(
              requiredMultilocFields.map((req) => [
                req,
                { ...schema?.properties?.[req], required: [locale] },
              ])
            );
            return {
              ...schema,
              properties: { ...schema.properties, ...requiredFieldsObject },
            };
          });
          setData((data) => ({
            ...Object.fromEntries(
              requiredMultilocFields.map((req) => [req, { [locale]: '' }])
            ),
            ...data,
          }));
        }
        setProcessingInitialMultiloc(false);
      }
    }, [locale, processingInitialMultiloc, schema]);

    const handleSubmit = async (formData?: any) => {
      // Any specified formData has priority over data attribute
      const submissionData = formData && formData.data ? formData.data : data;

      const sanitizedFormData = {};
      forOwn(submissionData, (value, key) => {
        sanitizedFormData[key] =
          value === null || value === '' || value === false ? undefined : value;
      });
      setData(sanitizedFormData);
      onChange?.(sanitizedFormData);
      setShowAllErrors(true);

      const [schemaToUse, dataWithoutHiddenFields] = getFormSchemaAndData(
        schema,
        uiSchema,
        submissionData,
        customAjv
      );
      if (
        customAjv.validate(
          schemaToUse,
          config === 'survey' ? dataWithoutHiddenFields : submissionData
        )
      ) {
        setLoading(true);
        try {
          await onSubmit(submissionData as FormData);
        } catch (e) {
          setApiErrors(e.errors);
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

    const layoutType = layout
      ? layout
      : isCategorization(uiSchema)
      ? 'fullpage'
      : 'inline';
    const renderers = selectRenderers(config || 'default');

    return (
      <Box
        as="form"
        minHeight={
          isSmallerThanPhone && layoutType === 'fullpage' && config !== 'survey'
            ? `calc(100vh - ${stylingConsts.menuHeight}px)`
            : '100%'
        }
        height={
          isSmallerThanPhone
            ? '100%'
            : layoutType === 'fullpage' && config !== 'survey'
            ? '100vh'
            : '100%'
        }
        display="flex"
        flexDirection="column"
        maxHeight={
          layoutType === 'inline'
            ? 'auto'
            : isSmallerThanPhone || config === 'survey'
            ? 'auto'
            : `calc(100vh - ${stylingConsts.menuHeight}px)`
        }
        id={uiSchema?.options?.formId}
      >
        <Box
          overflow={layoutType === 'inline' ? 'visible' : 'auto'}
          flex="1"
          marginBottom={
            layoutType === 'fullpage' && showSubmitButton ? '32px' : 'auto'
          }
        >
          {title && <Title>{title}</Title>}
          <APIErrorsContext.Provider value={apiErrors}>
            <FormContext.Provider
              value={{
                showAllErrors,
                inputId,
                getApiErrorMessage: safeApiErrorMessages(),
                onSubmit: handleSubmit,
                setShowAllErrors,
                setShowSubmitButton,
                formSubmitText,
              }}
            >
              <JsonForms
                schema={fixedSchema}
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
              {footer && (
                <Box display="flex" flexDirection="row" justifyContent="center">
                  <Box w="100%" maxWidth="700px" px="20px" mt="0px" mb="40px">
                    {footer}
                  </Box>
                </Box>
              )}
            </FormContext.Provider>
          </APIErrorsContext.Provider>
        </Box>
        {showSubmitButton && (
          <>
            {layoutType === 'fullpage' ? (
              <ButtonBar
                onSubmit={handleSubmit}
                apiErrors={Boolean(
                  apiErrors?.values?.length && apiErrors?.values?.length > 0
                )}
                processing={loading}
              />
            ) : submitOnEvent ? (
              <InvisibleSubmitButton onClick={handleSubmit} />
            ) : (
              <Button onClick={handleSubmit}>
                {formatMessage(messages.save)}
              </Button>
            )}
          </>
        )}
      </Box>
    );
  }
);

export default Form;
