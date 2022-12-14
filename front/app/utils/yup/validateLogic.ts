import { object } from 'yup';

type RuleType = { if: string | number; goto_page_id: string };

const validateLogic = (message: string) => {
  return object().when((obj, schema) => {
    return schema.test('return false', message, () => {
      if (obj && obj.rules) {
        obj.rules.map((rule: RuleType) => {
          if (rule.goto_page_id === 'temp') {
            return false;
          }
        });
        return true;
      }
      return true;
    });
  });
};

export default validateLogic;
