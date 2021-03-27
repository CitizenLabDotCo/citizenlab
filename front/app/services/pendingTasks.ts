import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

export interface IPendingTask {
  id: string;
  type: 'tagging';
  relationships: {
    ideas: { data: { id: string }[] };
    tags: { data: { id: string }[] };
  };
}
export type IPendingTasksData = { data: IPendingTask[] };

export function pendingTasksStream(streamParams: IStreamParams | null = null) {
  return streams.get<IPendingTasksData>({
    apiEndpoint: `${API_PATH}/pending_tasks`,
    ...streamParams,
  });
}
