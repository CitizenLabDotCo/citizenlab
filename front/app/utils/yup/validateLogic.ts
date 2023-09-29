import {
  IFlatCustomField,
  LogicType,
  QuestionRuleType,
} from 'api/custom_fields/types';
import { isNilOrError } from 'utils/helperUtils';
import { object } from 'yup';

export const isRuleValid = (
  rule: QuestionRuleType | undefined,
  fieldBeingValidatedId: string,
  fields: IFlatCustomField[]
) => {
  if ((rule && rule.goto_page_id === 'survey_end') || rule === undefined) {
    return true;
  }

  const indexOfTargetPage = fields.findIndex(function (field) {
    return (
      field.id === rule.goto_page_id || field.temp_id === rule.goto_page_id
    );
  });
  const indexOfSourceField = fields.findIndex(function (field) {
    return (
      field.id === fieldBeingValidatedId ||
      field.temp_id === fieldBeingValidatedId
    );
  });
  return indexOfTargetPage > indexOfSourceField;
};

export const isPageRuleValid = (
  fields: IFlatCustomField[],
  sourcePageId: string,
  nextPageId?: string
) => {
  if (nextPageId === 'survey_end' || !nextPageId) {
    return true;
  }
  const indexOfTargetPage = fields.findIndex(
    (field) => field.id === nextPageId || field.temp_id === nextPageId
  );
  const indexOfSourceField = fields.findIndex(
    (field) => field.id === sourcePageId || field.temp_id === sourcePageId
  );
  return indexOfTargetPage > indexOfSourceField;
};

const validateLogic = (message: string) => {
  return object()
    .shape({
      logic: object(),
    })
    .when('input_type', (input_type: string, schema) => {
      if (['select', 'linear_scale'].includes(input_type)) {
        return schema.test(
          'rules reference prior pages',
          message,
          (value: { rules: QuestionRuleType[] }, obj) => {
            // Extract current state of customFields
            const fields = obj.from[2].value.customFields;

            if (!isNilOrError(obj) && value && fields) {
              return (value.rules || []).every((rule) =>
                isRuleValid(rule, obj.parent.id, fields)
              );
            }
            return true;
          }
        );
      } else if (input_type === 'page') {
        return schema.test(
          'rules reference prior pages',
          message,
          (value: LogicType, obj) => {
            const fields = obj.from[2].value.customFields;

            if (!isNilOrError(obj) && value?.next_page_id && fields) {
              return isPageRuleValid(fields, obj.parent.id, value.next_page_id);
            }
            return true;
          }
        );
      }
      return schema;
    });
};

export default validateLogic;
