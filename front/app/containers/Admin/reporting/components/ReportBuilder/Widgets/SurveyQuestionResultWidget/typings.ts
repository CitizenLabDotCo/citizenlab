import { GroupMode } from 'api/graph_data_units/requestTypes';

export interface Props {
  projectId?: string;
  year?: number;
  quarter?: number;
  phaseId?: string;
  questionId?: string;
  groupMode?: GroupMode;
  groupFieldId?: string;
  heatmap?: boolean;
}
