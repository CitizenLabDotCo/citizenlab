import { IOptionsType } from 'services/formCustomFields';
import { object, array } from 'yup';

const validateOneOptionForMultiSelect = (message: string) => {
  return array()
    .of(
      object().shape({
        title_multiloc: object(),
      })
    )
    .when('input_type', (input_type: string, schema) => {
      if (input_type === 'multiselect' || input_type === 'select') {
        return schema.test('one-option', message, (options: IOptionsType[]) => {
          return options
            ? options.some((option: IOptionsType) => {
                return Object.values(option.title_multiloc).some(
                  (value: string) => value !== ''
                );
              })
            : false;
        });
      }
      return schema;
    });
};

export default validateOneOptionForMultiSelect;
