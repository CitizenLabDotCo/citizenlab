// types
import { FormBuilderConfig } from 'components/FormBuilder/utils';

// intl
import messages from './messages';

export const ideationConfig: FormBuilderConfig = {
  formBuilderTitle: messages.inputForm,
  viewFormLinkCopy: messages.viewFormLinkCopy,
  formSavedSuccessMessage: messages.successMessage,
  toolboxTitle: messages.customise,
  toolboxFieldsToExclude: ['page', 'file_upload'],
  formCustomFields: undefined,
  showStatusBadge: false,
  isLogicEnabled: false,
  isEditPermittedAfterSubmissions: true,
  groupingType: 'section',
};
