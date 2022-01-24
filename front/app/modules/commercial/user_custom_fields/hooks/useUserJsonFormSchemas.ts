import { useState, useEffect } from 'react';
import {
  IUserJsonFormSchemas,
  userJsonFormSchemasStream,
} from '../services/userCustomFields';
import { isEmpty, get } from 'lodash-es';
import useLocale from 'hooks/useLocale';
import { isNilOrError } from 'utils/helperUtils';

interface UserCustomFieldsInfos extends IUserJsonFormSchemas {
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
        setCustomFields({
          ...customFields,
          hasRequiredFields:
            !isNilOrError(locale) &&
            !isEmpty(
              get(customFields, `json_schema_multiloc.${locale}.required`, null)
            ),
          hasCustomFields:
            !isNilOrError(locale) &&
            !customFields?.ui_schema_multiloc?.[locale]?.elements.every(
              (e) => e?.options?.hidden
            ),
        });
      }
    );

    return () => subscription.unsubscribe();
  }, [locale]);

  return customFields;
}
