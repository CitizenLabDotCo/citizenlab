import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { Multiloc } from 'typings';

export function updatePollOption(optionId: string, titleMultiloc: Multiloc) {
  return streams.update(`${API_PATH}/poll_options/${optionId}`, optionId, {
    title_multiloc: titleMultiloc,
  });
}
