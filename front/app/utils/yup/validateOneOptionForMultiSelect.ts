import { IOptionsType } from 'api/custom_fields/types';
import { object, array, TestContext } from 'yup';

const validateOneOptionForMultiSelect = (
  genericErrorMessage: string,
  specificControlErrorMessage?: { [key: string]: string }
) => {
  return array()
    .of(
      object().shape({
        title_multiloc: object(),
      })
    )
    .when('input_type', (input_type: string, schema) => {
      if (['multiselect', 'select', 'multiselect_image'].includes(input_type)) {
        const message =
          specificControlErrorMessage &&
          Object.prototype.hasOwnProperty.call(
            specificControlErrorMessage,
            input_type
          )
            ? specificControlErrorMessage[input_type]
            : genericErrorMessage;

        return schema.test(
          'one-option',
          message,
          (options: IOptionsType[], testContext: TestContext) => {
            if (testContext.parent.key === 'topic_ids') {
              return true;
            }
            return options
              ? options.some((option: IOptionsType) => {
                  return Object.values(option.title_multiloc).some(
                    (value: string) => value !== ''
                  );
                })
              : false;
          }
        );
      }
      return schema;
    });
};

export default validateOneOptionForMultiSelect;
