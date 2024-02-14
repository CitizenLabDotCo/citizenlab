import { SliceMode } from 'api/graph_data_units/requestTypes';

export interface Props {
  projectId?: string;
  phaseId?: string;
  questionId?: string;
  sliceMode: SliceMode;
  sliceFieldId?: string;
}
