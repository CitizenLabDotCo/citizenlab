// services
import {
  ICustomFieldInputType,
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
} from 'services/formCustomFields';
import { IPhaseData } from 'services/phases';
import { IProjectData } from 'services/projects';

// utils
import { isNilOrError } from 'utils/helperUtils';

// types
import { MessageDescriptor } from 'utils/cl-intl';

export type FormBuilderConfig = {
  formBuilderTitle: MessageDescriptor;
  viewFormLinkCopy: MessageDescriptor;
  formSavedSuccessMessage: MessageDescriptor;
  toolboxTitle: MessageDescriptor;
  supportArticleLink?: MessageDescriptor;
  formEndPageLogicOption?: MessageDescriptor;
  questionLogicHelperText?: MessageDescriptor;
  pagesLogicHelperText?: MessageDescriptor;

  toolboxFieldsToExclude: ICustomFieldInputType[];
  formCustomFields: IFlatCustomField[] | undefined | Error;

  isRequiredToggleAllowed?: (field: IFlatCustomFieldWithIndex) => boolean;
  isResponseToggleAllowed?: (field: IFlatCustomFieldWithIndex) => boolean;
  isEnabledToggleAllowed?: (field: IFlatCustomFieldWithIndex) => boolean;
  isTitleConfigurable?: (field: IFlatCustomFieldWithIndex) => boolean;

  showStatusBadge: boolean;
  isLogicEnabled: boolean;
  isEditPermittedAfterSubmissions: boolean;

  viewFormLink?: string;

  getDeleteFormResultsNotice?: (projectId: string) => void;
  goBackUrl?: string;
};

export const getUpdatedConfiguration = (
  config: FormBuilderConfig,
  formCustomFields?: IFlatCustomField[] | undefined | Error,
  goBackUrl?: string | undefined
) => {
  config.goBackUrl = goBackUrl;
  config.formCustomFields = formCustomFields;
  return config;
};

export const getIsPostingEnabled = (
  project: IProjectData,
  phase?: IPhaseData | Error | null | undefined
) => {
  if (!isNilOrError(phase)) {
    return phase.attributes.posting_enabled;
  }

  return project.attributes.posting_enabled;
};
