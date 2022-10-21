import { JsonSchema7, Layout } from '@jsonforms/core';
import useLocale from 'hooks/useLocale';
import { get, isEmpty } from 'lodash-es';
import { useEffect, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { userJsonFormSchemasStream } from '../services/userCustomFields';

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
                  !(
                    customFields?.ui_schema_multiloc?.[locale]?.elements
                      ?.length === 0
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
