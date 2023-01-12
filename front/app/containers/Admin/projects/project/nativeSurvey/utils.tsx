// types
import { FormBuilderConfig } from 'components/FormBuilder/utils';
import { IFlatCustomField } from 'services/formCustomFields';

// intl
import messages from './messages';

export const getUpdatedConfiguration = (
  config: FormBuilderConfig,
  formCustomFields: IFlatCustomField[] | undefined | Error
) => {
  config.formCustomFields = formCustomFields;
  return config;
};

export const nativeSurveyConfig: FormBuilderConfig = {
  formBuilderTitle: messages.survey,
  formCustomFields: undefined,
  showStatusBadge: true,
};
