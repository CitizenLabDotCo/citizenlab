import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { Multiloc } from 'typings';

export interface IPollOptions {
  data: IPollOptionData[];
}

export interface IPollOptionData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    ordering: number;
  };
}

export function pollOptionsStream(questionId: string) {
  return streams.get<IPollOptions>({
    apiEndpoint: `${API_PATH}/poll_questions/${questionId}/poll_options`,
  });
}

export function addPollOption(questionId: string, titleMultiloc: Multiloc) {
  return streams.add<IPollOptions>(
    `${API_PATH}/poll_questions/${questionId}/poll_options`,
    {
      title_multiloc: titleMultiloc,
    }
  );
}

export function pollOptionStream(optionId: string) {
  return streams.get<{ data: IPollOptionData }>({
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
