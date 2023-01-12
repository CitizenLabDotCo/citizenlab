// services
import {
  ICustomFieldInputType,
  IFlatCustomField,
} from 'services/formCustomFields';
import { IPhaseData } from 'services/phases';
import { IProjectData } from 'services/projects';

// utils
import { isNilOrError } from 'utils/helperUtils';

type MessageType = { id: string; defaultMessage: string };

export type FormBuilderConfig = {
  formBuilderTitle: MessageType;
  viewFormLinkCopy: MessageType;
  formSavedSuccessMessage: MessageType;
  toolboxTitle: MessageType;
  supportArticleLink?: MessageType;
  formEndPageLogicOption?: MessageType;
  questionLogicHelperText?: MessageType;
  pagesLogicHelperText?: MessageType;

  toolboxFieldsToExclude: ICustomFieldInputType[];
  formCustomFields: IFlatCustomField[] | undefined | Error;

  showStatusBadge: boolean;
  isLogicEnabled: boolean;
  isEditPermittedAfterSubmissions: boolean;

  getDeleteFormResultsNotice?: (projectId: string) => void;
  getGoBackUrl: (projectId: string) => string;
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
