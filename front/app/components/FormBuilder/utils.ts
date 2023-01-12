// Services
import { IFlatCustomField } from 'services/formCustomFields';
import { IPhaseData } from 'services/phases';
import { IProjectData } from 'services/projects';

// Utils
import { isNilOrError } from 'utils/helperUtils';

export type FormBuilderConfig = {
  formBuilderTitle: { id: string; defaultMessage: string };
  formCustomFields: IFlatCustomField[] | undefined | Error;
  showStatusBadge: boolean;
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
