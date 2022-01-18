import { useState, useEffect } from 'react';
import {
  customFieldsSchemaForUsersStream,
  UserCustomFieldsInfos,
} from '../services/userCustomFields';
import { localeStream } from 'services/locale';
import { combineLatest } from 'rxjs';
import { isEmpty, get } from 'lodash-es';
import { hasCustomFields } from '../utils/customFields';

export type UserCustomFieldsSchema =
  | UserCustomFieldsInfos
  | undefined
  | null
  | Error;

export default function useUserCustomFieldsSchema() {
  const [customFields, setCustomFields] =
    useState<UserCustomFieldsSchema>(undefined);

  useEffect(() => {
    const locale$ = localeStream().observable;
    const customFieldsSchemaForUsersStream$ =
      customFieldsSchemaForUsersStream().observable;

    const subscription = combineLatest([
      locale$,
      customFieldsSchemaForUsersStream$,
    ]).subscribe(([locale, customFields]) => {
      setCustomFields({
        schema: customFields['json_schema_multiloc'][locale],
        uiSchema: customFields['ui_schema_multiloc'][locale],
        hasRequiredFields: !isEmpty(
          get(customFields, `json_schema_multiloc.${locale}.required`, null)
        ),
        hasCustomFields: hasCustomFields(customFields, locale),
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  return customFields;
}
