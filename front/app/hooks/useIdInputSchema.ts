import { Layout } from '@jsonforms/core';
import { useEffect, useState } from 'react';
import {
  ideaIdJsonFormsSchemaStream,
  JsonFormsSchema,
} from 'services/ideaJsonFormsSchema';
import { isNilOrError } from 'utils/helperUtils';
import useAppConfigurationLocales from './useAppConfigurationLocales';
import useLocale from './useLocale';

export default (inputId: string, schemaType: 'json_forms_schema') => {
  const [schema, setSchema] = useState<JsonFormsSchema | null>(null);
  const [uiSchema, setUiSchema] = useState<Layout | null>(null);
  const [isError, setIsError] = useState(false);
  const locale = useLocale();
  const locales = useAppConfigurationLocales();

  useEffect(() => {
    const observable = ideaIdJsonFormsSchemaStream(
      inputId,
      schemaType
    ).observable;

    const subscription = observable.subscribe((response) => {
      if (isNilOrError(response)) {
        setSchema(null);
        setUiSchema(null);
        setIsError(true);
      } else {
        setIsError(false);
        setSchema(
          (!isNilOrError(locale) && response.json_schema_multiloc[locale]) ||
            (!isNilOrError(locales) &&
              response.json_schema_multiloc[locales[0]]) ||
            null
        );
        setUiSchema(
          (!isNilOrError(locale) && response.ui_schema_multiloc[locale]) ||
            (!isNilOrError(locales) &&
              response.ui_schema_multiloc[locales[0]]) ||
            null
        );
      }
    });

    return () => subscription.unsubscribe();
  }, [inputId, locale, locales, schemaType]);

  return { schema, uiSchema, inputSchemaError: isError };
};
