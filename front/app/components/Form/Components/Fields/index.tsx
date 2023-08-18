import React, { useState, useCallback } from 'react';

// jsonforms
import { JsonForms } from '@jsonforms/react';
import {
  createAjv,
  JsonSchema7,
  UISchemaElement,
  Translator,
  Layout,
} from '@jsonforms/core';

// i18n
import { useIntl, MessageDescriptor } from 'utils/cl-intl';
import useLocale from 'hooks/useLocale';

// utils
import { selectRenderers } from './formConfig';
import { getDefaultAjvErrorMessage } from 'utils/errorUtils';
import { parseRequiredMultilocsSchema } from '../../parseRequiredMultilocs';
import { isNilOrError } from 'utils/helperUtils';

// typings
import { CLErrors, Locale } from 'typings';
import { ApiErrorGetter, AjvErrorGetter, FormData } from '../../typings';
import { ErrorObject } from 'ajv';
import { APIErrorsContext, FormContext } from '../../contexts';

const customAjv = createAjv({ useDefaults: 'empty', removeAdditional: true });

interface Props {
  data: FormData;
  apiErrors?: CLErrors;
  showAllErrors: boolean;
  setShowAllErrors: (showAllErrors: boolean) => void;
  schema: JsonSchema7;
  uiSchema: Layout;
  getApiErrorMessage?: ApiErrorGetter;
  getAjvErrorMessage: AjvErrorGetter;
  inputId?: string;
  formSubmitText?: MessageDescriptor;
  config?: 'default' | 'input' | 'survey';
  onChange: (formData: FormData) => void;
  onSubmit: (formData: FormData) => Promise<any>;
}

interface InnerProps extends Props {
  locale: Locale;
}

const Fields = ({
  locale,
  data,
  apiErrors,
  showAllErrors,
  setShowAllErrors,
  schema,
  uiSchema,
  inputId,
  formSubmitText,
  getAjvErrorMessage,
  getApiErrorMessage,
  config,
  onChange,
  onSubmit,
}: InnerProps) => {
  const [parsedSchema] = useState(() => {
    return parseRequiredMultilocsSchema(schema, locale);
  });

  const { formatMessage } = useIntl();

  const safeApiErrorMessages = useCallback(
    () => (getApiErrorMessage ? getApiErrorMessage : () => undefined),
    [getApiErrorMessage]
  );

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

  const renderers = selectRenderers(config || 'default');

  return (
    <APIErrorsContext.Provider value={apiErrors}>
      <FormContext.Provider
        value={{
          showAllErrors,
          inputId,
          getApiErrorMessage: safeApiErrorMessages(),
          onSubmit,
          setShowAllErrors,
          formSubmitText,
        }}
      >
        <JsonForms
          schema={parsedSchema}
          uischema={uiSchema}
          data={data}
          renderers={renderers}
          onChange={({ data }) => {
            onChange(data);
          }}
          validationMode="ValidateAndShow"
          ajv={customAjv}
          i18n={{
            translateError,
          }}
        />
      </FormContext.Provider>
    </APIErrorsContext.Provider>
  );
};

const FieldsOuter = (props: Props) => {
  const locale = useLocale();
  if (isNilOrError(locale)) return null;

  return <Fields locale={locale} {...props} />;
};

export default FieldsOuter;
