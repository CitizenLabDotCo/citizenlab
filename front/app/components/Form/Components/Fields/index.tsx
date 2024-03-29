import React, { useCallback, useState } from 'react';

// jsonforms
import {
  JsonSchema7,
  UISchemaElement,
  Translator,
  Layout,
} from '@jsonforms/core';
import { JsonForms } from '@jsonforms/react';
import Ajv, { ErrorObject } from 'ajv';
import { CLErrors, Locale } from 'typings';

import { parseRequiredMultilocsSchema } from 'components/Form/parseRequiredMultilocs';

import { useIntl } from 'utils/cl-intl';
import { getDefaultAjvErrorMessage } from 'utils/errorUtils';

import { APIErrorsContext, FormContext } from '../../contexts';
import { ApiErrorGetter, AjvErrorGetter, FormData } from '../../typings';

import { selectRenderers } from './formConfig';

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
  config?: 'default' | 'input' | 'survey';
  locale: Locale;
  onChange: (formData: FormData) => void;
  setFormData?: (formData: FormData) => void;
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
