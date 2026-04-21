import { IUpdatedProjectProperties } from 'api/projects/types';

import { ISubmitState } from 'components/admin/SubmitWrapper';

export type TOnProjectAttributesDiffChangeFunction = (
  projectAttributesDiff: IUpdatedProjectProperties,
  submitState?: ISubmitState
) => void;
