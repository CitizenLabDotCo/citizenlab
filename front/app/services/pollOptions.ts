import { API_PATH } from 'containers/App/constants';
import { Multiloc } from 'typings';
import streams from 'utils/streams';

export interface IPollOption {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    ordering: number;
  };
}

export function pollOptionsStream(questionId: string) {
  return streams.get<{ data: IPollOption[] }>({
    apiEndpoint: `${API_PATH}/poll_questions/${questionId}/poll_options`,
  });
}

export function addPollOption(questionId: string, titleMultiloc: Multiloc) {
  return streams.add<{ data: IPollOption }>(
    `${API_PATH}/poll_questions/${questionId}/poll_options`,
    {
      title_multiloc: titleMultiloc,
    }
  );
}

export function pollOptionStream(optionId: string) {
  return streams.get<{ data: IPollOption }>({
    apiEndpoint: `${API_PATH}/poll_options/${optionId}`,
  });
}

export function deletePollOption(optionId: string) {
  return streams.delete(`${API_PATH}/poll_options/${optionId}`, optionId);
}

export function updatePollOption(optionId: string, titleMultiloc: Multiloc) {
  return streams.update(`${API_PATH}/poll_options/${optionId}`, optionId, {
    title_multiloc: titleMultiloc,
  });
}
