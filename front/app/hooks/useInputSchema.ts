import { Layout } from '@jsonforms/core';
import { useEffect, useState } from 'react';
import {
  ideaJsonFormsSchemaStream,
  JsonFormsSchema,
} from 'services/ideaJsonFormsSchema';
import { isNilOrError } from 'utils/helperUtils';
import useAppConfigurationLocales from './useAppConfigurationLocales';
import useLocale from './useLocale';

export default (projectId: string | undefined) => {
  const [schema, setSchema] = useState<JsonFormsSchema | null>(null);
  const [uiSchema, setUiSchema] = useState<Layout | null>(null);
  const [isError, setIsError] = useState(false);
  const locale = useLocale();
  const locales = useAppConfigurationLocales();

  useEffect(() => {
    if (!projectId) return;

    const observable = ideaJsonFormsSchemaStream(projectId).observable;

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
  }, [projectId, locale, locales]);

  return { schema, uiSchema, inputSchemaError: isError };
};
