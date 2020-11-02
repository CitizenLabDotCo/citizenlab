import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { Multiloc } from 'typings';

const apiEndpoint = `${API_PATH}/tag_suggestions`;

// web_api/v1/tag_suggestions?idea_ids= [the list of ids]&locale="the local the admin uses"

export interface ITag {
  id: string;
  attributes: {
    title_multiloc: Multiloc;
  };
  type: 'tag';
}

export interface ITagReponseData {
  data: ITag[];
}

export function tagSuggestionStream(streamParams: IStreamParams | null = null) {
  return streams.get<ITagReponseData>({ apiEndpoint, ...streamParams });
}
