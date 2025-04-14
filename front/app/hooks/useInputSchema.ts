import useIdeaJsonFormSchema from 'api/idea_json_form_schema/useIdeaJsonFormSchema';

import useAppConfigurationLocales from './useAppConfigurationLocales';
import useLocale from './useLocale';

interface Props {
  projectId?: string;
  phaseId?: string | null;
  inputId?: string | null;
}
const useInputSchema = ({ projectId, phaseId, inputId }: Props) => {
  const {
    data: ideaJsonFormSchema,
    isError,
    ...otherAttributes
  } = useIdeaJsonFormSchema({
    projectId,
    phaseId,
    inputId,
  });
  const locale = useLocale();
  const locales = useAppConfigurationLocales();

  const schema =
    ideaJsonFormSchema?.data.attributes.json_schema_multiloc[locale] ||
    (locales &&
      ideaJsonFormSchema?.data.attributes.json_schema_multiloc[locales[0]]) ||
    null;

  const uiSchema =
    ideaJsonFormSchema?.data.attributes.ui_schema_multiloc[locale] ||
    (locales &&
      ideaJsonFormSchema?.data.attributes.ui_schema_multiloc[locales[0]]) ||
    null;

  return { schema, uiSchema, inputSchemaError: isError, ...otherAttributes };
};

export default useInputSchema;
