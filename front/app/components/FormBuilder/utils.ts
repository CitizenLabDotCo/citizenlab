// Services
import {
  ICustomFieldInputType,
  IFlatCustomField,
} from 'services/formCustomFields';
import { IPhaseData } from 'services/phases';
import { IProjectData } from 'services/projects';

// Utils
import { isNilOrError } from 'utils/helperUtils';

type MessageType = { id: string; defaultMessage: string };

export type FormBuilderConfig = {
  formBuilderTitle: MessageType;
  viewFormLinkCopy: MessageType;
  formSavedSuccessMessage: MessageType;
  toolboxTitle: MessageType;
  toolboxFieldsToExclude: ICustomFieldInputType[];
  formCustomFields: IFlatCustomField[] | undefined | Error;
  showStatusBadge: boolean;
  isLogicEnabled: boolean;
  isEditPermittedAfterSubmissions: boolean;
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
