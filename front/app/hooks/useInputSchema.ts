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

  const schema =
    (!isNilOrError(locale) &&
      ideaJsonFormSchema?.data.attributes.json_schema_multiloc[locale]) ||
    (!isNilOrError(locales) &&
      ideaJsonFormSchema?.data.attributes.json_schema_multiloc[locales[0]]) ||
    null;

  const uiSchema =
    (!isNilOrError(locale) &&
      ideaJsonFormSchema?.data.attributes.ui_schema_multiloc[locale]) ||
    (!isNilOrError(locales) &&
      ideaJsonFormSchema?.data.attributes.ui_schema_multiloc[locales[0]]) ||
    null;

  return { schema, uiSchema, inputSchemaError: isError };
};

export default useInputSchema;
