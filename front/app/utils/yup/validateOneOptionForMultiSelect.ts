import { object, array, TestContext } from 'yup';

import { IOptionsType } from 'api/custom_fields/types';

const validateOneOptionForMultiSelect = (
  noOptionGenericMessage: string,
  everyOptionTitleMessage: string,
  specificControlNoOptionMessage?: { [key: string]: string }
) => {
  return array()
    .of(
      object().shape({
        title_multiloc: object(),
      })
    )
    .when('input_type', (input_type: string, schema) => {
      if (['multiselect', 'select', 'multiselect_image'].includes(input_type)) {
        const noOptionMessage =
          specificControlNoOptionMessage &&
          Object.prototype.hasOwnProperty.call(
            specificControlNoOptionMessage,
            input_type
          )
            ? specificControlNoOptionMessage[input_type]
            : noOptionGenericMessage;

        return schema
          .test(
            'one-option',
            noOptionMessage,
            (options: IOptionsType[], testContext: TestContext) => {
              if (testContext.parent.key === 'topic_ids') {
                return true;
              }
              // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              return options
                ? options.some((option: IOptionsType) => {
                    return Object.values(option.title_multiloc).some(
                      (value: string) => value !== ''
                    );
                  })
                : false;
            }
          )
          .test(
            'every-option-has-title',
            everyOptionTitleMessage,
            (options: IOptionsType[], testContext: TestContext) => {
              if (testContext.parent.key === 'topic_ids') {
                return true;
              }
              // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              return options
                ? options.every((option: IOptionsType) => {
                    return (
                      Object.keys(option.title_multiloc).length > 0 &&
                      Object.values(option.title_multiloc).some(
                        (value: string) => value !== ''
                      )
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
