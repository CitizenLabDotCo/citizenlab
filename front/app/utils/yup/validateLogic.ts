import { RuleType } from 'containers/Admin/formBuilder/components/FormBuilderSettings/utils';
import { IFlatCustomField } from 'services/formCustomFields';
import { isNilOrError } from 'utils/helperUtils';
import { object } from 'yup';

export const isRuleValid = (
  rule: RuleType | undefined,
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

const validateLogic = (message: string) => {
  return object()
    .shape({
      logic: object(),
    })
    .when('input_type', (input_type: string, schema) => {
      if (input_type === 'select' || input_type === 'linear_scale') {
        return schema.test(
          'rules reference prior pages',
          message,
          (value: { rules: RuleType[] }, obj) => {
            // Extract current state of customFields
            const fields = obj.from[2].value.customFields;

            if (!isNilOrError(obj) && value && fields) {
              let hasError = false;
              value.rules.map((rule) => {
                if (!isRuleValid(rule, obj.parent.id, fields)) {
                  hasError = true;
                }
              });
              return !hasError;
            }
            // Otherwise return true, because no rules are set
            return true;
          }
        );
      }
      return schema.test('not a select or lienar scale field', message, () => {
        return true;
      });
    });
};

export default validateLogic;
