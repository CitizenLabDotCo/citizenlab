import { isNilOrError } from 'utils/helperUtils';
import useAppConfigurationLocales from './useAppConfigurationLocales';
import useLocale from './useLocale';
import useIdeaJsonFormSchema from 'api/idea_json_form_schema/useIdeaJsonFormSchema';

interface Props {
  projectId: string | undefined;
  phaseId?: string | null;
  inputId?: string | null;
}
const useInputSchema = ({ projectId, phaseId, inputId }: Props) => {
  const { data: ideaJsonFormSchema, isError } = useIdeaJsonFormSchema({
    projectId,
    phaseId,
    inputId,
  });
  const locale = useLocale();
  const locales = useAppConfigurationLocales();

  // const schema =
  //   (!isNilOrError(locale) &&
  //     ideaJsonFormSchema?.data.attributes.json_schema_multiloc[locale]) ||
  //   (!isNilOrError(locales) &&
  //     ideaJsonFormSchema?.data.attributes.json_schema_multiloc[locales[0]]) ||
  //   null;

  // const uiSchema =
  //   (!isNilOrError(locale) &&
  //     ideaJsonFormSchema?.data.attributes.ui_schema_multiloc[locale]) ||
  //   (!isNilOrError(locales) &&
  //     ideaJsonFormSchema?.data.attributes.ui_schema_multiloc[locales[0]]) ||
  //   null;

  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      mc_w_constraints: {
        type: 'array',
        uniqueItems: true,
        minItems: 1,
        items: {
          type: 'string',
          oneOf: [
            {
              const: 'option_1',
              title: 'Option 1',
            },
            {
              const: 'option_2',
              title: 'Option 2',
            },
            {
              const: 'option_3',
              title: 'Option 3',
            },
            {
              const: 'other',
              title: 'Other',
            },
          ],
        },
      },
      mc_w_constraints_other: {
        type: 'string',
      },
    },
    required: ['mc_w_constraints', 'mc_w_constraints_other'],
  };

  const uiSchema = {
    type: 'Categorization',
    options: {
      formId: 'idea-form',
      inputTerm: 'idea',
    },
    elements: [
      {
        type: 'Page',
        options: {
          input_type: 'page',
          id: 'a132c95b-532f-424b-8090-8bdefb5eb3a4',
          title: '',
          description: '',
        },
        elements: [
          {
            type: 'Control',
            scope: '#/properties/mc_w_constraints',
            label: 'MC w constraints',
            options: {
              description: '',
              input_type: 'multiselect',
              isAdminField: false,
              hasRule: false,
            },
          },
          {
            type: 'Control',
            scope: '#/properties/mc_w_constraints_other',
            label: 'Other (test)',
            options: {
              description: '',
              input_type: 'text',
              isAdminField: false,
              hasRule: false,
              transform: 'trim_on_blur',
            },
            rule: {
              effect: 'HIDE',
              condition: {
                scope: '#',
                schema: {
                  properties: {
                    mc_w_constraints: { not: { contains: { const: 'other' } } },
                  },
                },
              },
            },
          },
        ],
      },
      {
        type: 'Page',
        options: {
          id: 'survey_end',
          title: 'Survey end',
          description:
            "Please submit your answers by selecting 'Submit survey' below.",
        },
        elements: [],
      },
    ],
  };

  return { schema, uiSchema, inputSchemaError: isError };
};

export default useInputSchema;
