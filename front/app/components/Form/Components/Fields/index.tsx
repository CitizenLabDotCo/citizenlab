import React, { useCallback, useState } from 'react';

// jsonforms
import { JsonForms } from '@jsonforms/react';
import {
  JsonSchema7,
  UISchemaElement,
  Translator,
  Layout,
} from '@jsonforms/core';

// i18n
import { useIntl, MessageDescriptor } from 'utils/cl-intl';

// utils
import { selectRenderers } from './formConfig';
import { getDefaultAjvErrorMessage } from 'utils/errorUtils';
import { parseRequiredMultilocsSchema } from 'components/Form/parseRequiredMultilocs';

// typings
import { CLErrors, Locale } from 'typings';
import { ApiErrorGetter, AjvErrorGetter, FormData } from '../../typings';
import Ajv, { ErrorObject } from 'ajv';
import { APIErrorsContext, FormContext } from '../../contexts';

interface Props {
  ajv: Ajv;
  data: FormData;
  apiErrors?: CLErrors;
  showAllErrors: boolean;
  setShowAllErrors?: (showAllErrors: boolean) => void;
  schema: JsonSchema7;
  uiSchema: Layout;
  getApiErrorMessage?: ApiErrorGetter;
  getAjvErrorMessage?: AjvErrorGetter;
  inputId?: string;
  formSubmitText?: MessageDescriptor;
  config?: 'default' | 'input' | 'survey';
  locale: Locale;
  onChange: (formData: FormData) => void;
  setFormData: (formData: FormData) => void;
  onSubmit?: (formData: FormData) => Promise<any>;
}

const Fields = ({
  ajv,
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
  locale,
  onChange,
  setFormData,
  onSubmit,
}: Props) => {
  const { formatMessage } = useIntl();

  const [parsedSchema] = useState(() => {
    return parseRequiredMultilocsSchema(schema, locale);
  });

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
          setFormData,
          locale,
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
          ajv={ajv}
          i18n={{
            translateError,
          }}
        />
      </FormContext.Provider>
    </APIErrorsContext.Provider>
  );
};

export default Fields;
