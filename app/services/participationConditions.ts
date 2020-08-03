import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

import { Multiloc, IParticipationContextType, ICitizenAction } from 'typings';

export type IParticipationConditions = Multiloc[][];

export function getParticipationConditions(
  id: string,
  type: IParticipationContextType,
  action: ICitizenAction
) {
  return streams.get<IParticipationConditions>({
    apiEndpoint: `${API_PATH}/${type}s/${id}/permissions/${action}/participation_conditions`,
  });
}
