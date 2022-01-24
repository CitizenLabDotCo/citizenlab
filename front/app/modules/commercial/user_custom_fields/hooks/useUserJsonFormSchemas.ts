import { useState, useEffect } from 'react';
import {
  IUserJsonFormSchemas,
  userJsonFormSchemasStream,
} from '../services/userCustomFields';
import { isEmpty, get } from 'lodash-es';
import { hasCustomFields } from '../utils/customFields';
import useLocale from 'hooks/useLocale';

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
          hasRequiredFields: Boolean(
            locale &&
              !isEmpty(
                get(
                  customFields,
                  `json_schema_multiloc.${locale}.required`,
                  null
                )
              )
          ),
          hasCustomFields: hasCustomFields(customFields, locale),
        });
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return customFields;
}
