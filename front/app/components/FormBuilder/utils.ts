// services
import {
  ICustomFieldInputType,
  IFlatCustomField,
} from 'api/custom_fields/types';
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

// utils
import { isNilOrError } from 'utils/helperUtils';

// types
import { MessageDescriptor } from 'utils/cl-intl';

export type FormBuilderConfig = {
  formBuilderTitle: MessageDescriptor;
  viewFormLinkCopy: MessageDescriptor;
  formSavedSuccessMessage: MessageDescriptor;
  toolboxTitle?: MessageDescriptor;
  supportArticleLink?: MessageDescriptor;
  formEndPageLogicOption?: MessageDescriptor;
  questionLogicHelperText?: MessageDescriptor;
  pagesLogicHelperText?: MessageDescriptor;

  toolboxFieldsToExclude: ICustomFieldInputType[];
  formCustomFields: IFlatCustomField[] | undefined | Error;

  displayBuiltInFields: boolean;
  showStatusBadge: boolean;
  isLogicEnabled: boolean;
  isEditPermittedAfterSubmissions: boolean;
  alwaysShowCustomFields: boolean;
  isFormPhaseSpecific: boolean;

  viewFormLink?: string;

  getDeletionNotice?: (projectId: string) => void;
  getWarningNotice?: () => void;

  goBackUrl?: string;
  groupingType: 'page' | 'section';
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

export const builtInFieldKeys = [
  'title_multiloc',
  'body_multiloc',
  'proposed_budget',
  'topic_ids',
  'location_description',
  'idea_images_attributes',
  'idea_files_attributes',
  'topic_ids',
];

export type BuiltInKeyType = (typeof builtInFieldKeys)[number];
