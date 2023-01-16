// types
import { FormBuilderConfig } from 'components/FormBuilder/utils';
import { IFlatCustomFieldWithIndex } from 'services/formCustomFields';

// intl
import messages from './messages';

export const ideationConfig: FormBuilderConfig = {
  formBuilderTitle: messages.inputForm,
  viewFormLinkCopy: messages.viewFormLinkCopy,
  formSavedSuccessMessage: messages.successMessage,
  toolboxTitle: messages.addFormContent,
  toolboxFieldsToExclude: ['page', 'file_upload'],
  formCustomFields: undefined,
  showStatusBadge: false,
  isLogicEnabled: false,
  isEditPermittedAfterSubmissions: true,

  isRequiredToggleDisabled: (field: IFlatCustomFieldWithIndex) => {
    const keysAlwaysRequired: string[] = ['title_multiloc', 'body_multiloc'];
    return keysAlwaysRequired.includes(field.key);
  },
  isResponseToggleDisabled: (field: IFlatCustomFieldWithIndex) => {
    const keysResponsesAlwaysShown: string[] = [
      'title_multiloc',
      'body_multiloc',
      'idea_images_attributes',
    ];
    return keysResponsesAlwaysShown.includes(field.key);
  },
  isEnableToggleDisabled: (field: IFlatCustomFieldWithIndex) => {
    const keysAlwaysEnabled: string[] = [
      'title_multiloc',
      'body_multiloc',
      'idea_images_attributes',
    ];
    return keysAlwaysEnabled.includes(field.key);
  },
  isTitleConfigurable: (field: IFlatCustomFieldWithIndex) => {
    const keysWithoutConfigurableTitle: string[] = [
      'title_multiloc',
      'body_multiloc',
      'idea_images_attributes',
    ];
    return !keysWithoutConfigurableTitle.includes(field.key);
  },
};
