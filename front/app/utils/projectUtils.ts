import { SupportedLocale } from 'typings';

import {
  IIdeaJsonFormSchemas,
  CustomFieldCodes,
} from 'api/idea_json_form_schema/types';
import { IPhaseData } from 'api/phases/types';

import { pastPresentOrFuture } from './dateUtils';
import { isNilOrError } from './helperUtils';

export function isFieldEnabled(
  fieldCode: CustomFieldCodes,
  ideaCustomFieldsSchemas:
    | IIdeaJsonFormSchemas['data']['attributes']
    | undefined
    | null
    | Error,
  locale: SupportedLocale | undefined | Error | null
): boolean {
  if (!isNilOrError(ideaCustomFieldsSchemas) && !isNilOrError(locale)) {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return !!(
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      ideaCustomFieldsSchemas.json_schema_multiloc?.[locale]?.properties?.[ // TODO: Fix this the next time the file is edited.
        fieldCode
      ]
    );
  }

  return true;
}

export function isPhaseActive(phase: IPhaseData): boolean {
  return (
    pastPresentOrFuture([
      phase.attributes.start_at,
      phase.attributes.end_at,
    ]) === 'present'
  );
}
