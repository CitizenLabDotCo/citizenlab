import { useState, useEffect } from 'react';
import { customFieldsSchemaForUsersStream } from 'services/userCustomFields';
import { localeStream } from 'services/locale';
import { combineLatest } from 'rxjs';
import { isEmpty, get } from 'lodash-es';
import { hasCustomFields } from 'utils/customFields';

interface CustomFieldsInfos {
  schema: any;
  uiSchema: any;
  hasRequiredFields: boolean;
  hasCustomFields: boolean;
}

export type CustomFieldsSchema = CustomFieldsInfos | undefined | null | Error;

export default function useCustomFieldsSchema() {
  const [customFields, setCustomFields] = useState<CustomFieldsSchema>(undefined);

  useEffect(() => {
    const locale$ = localeStream().observable;
    const customFieldsSchemaForUsersStream$ = customFieldsSchemaForUsersStream().observable;

    const subscription = combineLatest(
        locale$,
        customFieldsSchemaForUsersStream$
      ).subscribe(([locale, customFields]) => {
        setCustomFields({
          schema: customFields['json_schema_multiloc'][locale],
          uiSchema: customFields['ui_schema_multiloc'][locale],
          hasRequiredFields: !isEmpty(get(customFieldsSchemaForUsersStream, `json_schema_multiloc.${locale}.required`, null)),
          hasCustomFields: hasCustomFields(customFields, locale),
        });
      });

    return () => subscription.unsubscribe();
  }, []);

  return customFields;
}
