import { JsonForms } from '@jsonforms/react';
import React, {
  memo,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  createAjv,
  isCategorization,
  JsonSchema7,
  Translator,
  UISchemaElement,
} from '@jsonforms/core';
import styled from 'styled-components';

import {
  Box,
  fontSizes,
  media,
  stylingConsts,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import ButtonBar from './Components/ButtonBar';

import useObserveEvent from 'hooks/useObserveEvent';

import { ErrorObject } from 'ajv';
import useLocale from 'hooks/useLocale';
import { forOwn } from 'lodash-es';
import { WrappedComponentProps } from 'react-intl';
import { CLErrors, Message } from 'typings';
import { injectIntl } from 'utils/cl-intl';
import { getDefaultAjvErrorMessage } from 'utils/errorUtils';
import { isNilOrError } from 'utils/helperUtils';
import { APIErrorsContext, FormContext } from './contexts';
import { selectRenderers } from './formConfig';

// hopefully we can standardize this someday
const Title = styled.h1`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.xxxxl}px;
  line-height: 40px;
  font-weight: 500;
  text-align: center;
  margin: 0;
  padding: 0;
  padding-top: 60px;
  padding-bottom: 40px;

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
) => Message | undefined;

export type ApiErrorGetter = (
  errorKey: string,
  fieldName: string
) => Message | undefined;

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
  config?: 'default' | 'input';
}

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
    config,
    intl: { formatMessage },
  }: Props & WrappedComponentProps) => {
    const [data, setData] = useState<FormData>(initialFormData);
    const [apiErrors, setApiErrors] = useState<CLErrors | undefined>();
    const [loading, setLoading] = useState(false);
    const [showAllErrors, setShowAllErrors] = useState(false);
    const safeApiErrorMessages = useCallback(
      () => (getApiErrorMessage ? getApiErrorMessage : () => undefined),
      [getApiErrorMessage]
    );
    const isSmallerThanXlPhone = useBreakpoint('phone');

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
    const layoutType = isCategorization(uiSchema) ? 'fullpage' : 'inline';
    const renderers = selectRenderers(config || 'default');

    return (
      <Box
        as="form"
        minHeight={
          isSmallerThanXlPhone && layoutType === 'fullpage'
            ? `calc(100vh - ${stylingConsts.menuHeight}px)`
            : '100%'
        }
        height={
          isSmallerThanXlPhone
            ? '100%'
            : layoutType === 'fullpage'
            ? '100vh'
            : '100%'
        }
        display="flex"
        flexDirection="column"
        maxHeight={
          layoutType === 'inline'
            ? 'auto'
            : isSmallerThanXlPhone
            ? 'auto'
            : `calc(100vh - ${stylingConsts.menuHeight}px)`
        }
        id={uiSchema?.options?.formId}
      >
        <Box
          overflow={layoutType === 'inline' ? 'visible' : 'auto'}
          flex="1"
          marginBottom={layoutType === 'fullpage' ? '32px' : 'auto'}
        >
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
            </FormContext.Provider>
          </APIErrorsContext.Provider>
        </Box>
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
          <Button onClick={handleSubmit}>Button</Button>
        )}
      </Box>
    );
  }
);

export default injectIntl(Form);
