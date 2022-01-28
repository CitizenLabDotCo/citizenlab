import { useState, useEffect } from 'react';
import { userJsonFormSchemasStream } from '../services/userCustomFields';
import { isEmpty, get } from 'lodash-es';
import useLocale from 'hooks/useLocale';
import { isNilOrError } from 'utils/helperUtils';
import { JsonSchema7, Layout } from '@jsonforms/core';

interface UserCustomFieldsInfos {
  schema: JsonSchema7 | undefined;
  uiSchema: Layout | undefined;
  hasRequiredFields: boolean;
  hasCustomFields: boolean;
}

export default function useUserJsonFormsSchemas() {
  const [customFields, setCustomFields] = useState<
    UserCustomFieldsInfos | Error | undefined | null
  >(undefined);

  const locale = useLocale();

  useEffect(() => {
    const subscription = userJsonFormSchemasStream().observable.subscribe(
      (customFields) => {
        setCustomFields(
          !isNilOrError(locale)
            ? {
                schema: customFields.json_schema_multiloc[locale],
                uiSchema: customFields.ui_schema_multiloc[locale],
                hasRequiredFields:
                  !isNilOrError(locale) &&
                  !isEmpty(
                    get(
                      customFields,
                      `json_schema_multiloc.${locale}.required`,
                      null
                    )
                  ),
                hasCustomFields:
                  !isNilOrError(locale) &&
                  !customFields?.ui_schema_multiloc?.[locale]?.elements.every(
                    (e) => e?.options?.hidden
                  ),
              }
            : null
        );
      }
    );

    return () => subscription.unsubscribe();
  }, [locale]);

  return customFields;
}
