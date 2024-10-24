import React, { useCallback, useState } from 'react';

// jsonforms
import { JsonSchema7, Translator, Layout } from '@jsonforms/core';
import { JsonForms } from '@jsonforms/react';
import { ErrorObject } from 'ajv';
import { CLErrors, SupportedLocale } from 'typings';

import { parseRequiredMultilocsSchema } from 'components/Form/parseRequiredMultilocs';
import { customAjv } from 'components/Form/utils';

import { useIntl } from 'utils/cl-intl';
import { getDefaultAjvErrorMessage } from 'utils/errorUtils';

import { APIErrorsContext, FormContext } from '../../contexts';
import { ApiErrorGetter, AjvErrorGetter, FormData } from '../../typings';
import { ExtendedUISchema } from '../Controls/visibilityUtils';

import { ErrorToReadProvider } from './ErrorToReadContext';
import { selectRenderers } from './formConfig';

interface Props {
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
  locale: SupportedLocale;
  onChange: (formData: FormData) => void;
  onSubmit?: (formData: FormData) => Promise<any>;
}

const Fields = ({
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
      uischema?: ExtendedUISchema
    ) => {
      const message =
        getAjvErrorMessage?.(error, uischema) ||
        getDefaultAjvErrorMessage({
          keyword: error.keyword,
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          format: error?.parentSchema?.format,
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          type: error?.parentSchema?.type,
        });
      return formatMessage(message, {
        ...error.params,
        fieldName: uischema?.label || '',
      });
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
          setFormData: onChange,
          locale,
        }}
      >
        <ErrorToReadProvider>
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
        </ErrorToReadProvider>
      </FormContext.Provider>
    </APIErrorsContext.Provider>
  );
};

export default Fields;
