import { useState, useEffect } from 'react';
import {
  customFieldsSchemaForUsersStream,
  UserCustomFieldsInfos,
} from 'services/userCustomFields';
import { localeStream } from 'services/locale';
import { combineLatest } from 'rxjs';
import { isEmpty, forOwn } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

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
      if (isNilOrError(customFields)) return;
      setCustomFields({
        schema: customFields.data.attributes['json_schema_multiloc'][locale],
        uiSchema: customFields.data.attributes['ui_schema_multiloc'][locale],
        hasRequiredFields: !isEmpty(
          customFields.data.attributes['json_schema_multiloc'][locale].required
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
  const customFieldNames =
    customFieldsSchemas.data.attributes['json_schema_multiloc'][locale]
      .properties;

  if (!isEmpty(customFieldNames)) {
    forOwn(customFieldNames, (_value, fieldName) => {
      const uiWidget =
        customFieldsSchemas.data.attributes['ui_schema_multiloc'][locale][
          fieldName
        ]['ui:widget'];

      if (uiWidget !== 'hidden') {
        hasCustomFields = true;
      }
    });
  }

  return hasCustomFields;
}
