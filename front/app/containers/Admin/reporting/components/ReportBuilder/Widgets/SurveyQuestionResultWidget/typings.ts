import { Multiloc } from 'component-library/utils/typings';

import { GroupMode, Sort } from 'api/graph_data_units/requestTypes';

export interface Props {
  projectId?: string;
  year?: number;
  quarter?: number;
  phaseId?: string;
  questionId?: string;
  groupMode?: GroupMode;
  groupFieldId?: string;
  heatmap?: boolean;
  ariaLabel?: Multiloc;
  description?: Multiloc;
  sort?: Sort;
}
