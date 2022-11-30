import { useState, useEffect } from 'react';
import {
  customFieldsSchemaForUsersStream,
  UserCustomFieldsInfos,
} from 'services/userCustomFields';
import { localeStream } from 'services/locale';
import { combineLatest } from 'rxjs';
import { isEmpty, get, forOwn } from 'lodash-es';

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

function hasCustomFields(customFieldsSchemas, locale) {
  // TODO
  let hasCustomFields = false;
  const customFieldNames = get(
    customFieldsSchemas,
    `json_schema_multiloc.${locale}.properties`,
    null
  );

  if (!isEmpty(customFieldNames)) {
    forOwn(customFieldNames, (_value, fieldName) => {
      const uiWidget = get(
        customFieldsSchemas,
        `ui_schema_multiloc.${locale}.${fieldName}.${'ui:widget'}`,
        null
      );

      if (uiWidget !== 'hidden') {
        hasCustomFields = true;
      }
    });
  }

  return hasCustomFields;
}
