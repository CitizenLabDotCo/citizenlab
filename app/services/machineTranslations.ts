import streams, { IStreamParams } from 'utils/streams';
import { API_PATH } from 'containers/App/constants';
import { IRelationship, Locale } from 'typings';

export interface IMachineTranslationData {
  id: string;
  type: string;
  attributes: {
    attribute_name: 'title_multiloc' | 'body_multiloc';
    locale_to: Locale;
    translation: string;
  };
  relationships: {
    translatable: {
      data: IRelationship;
    };
  };
}

export interface IMachineTranslation {
  data: IMachineTranslationData;
}

export function machineTranslationByIdeaIdStream(
  ideaId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IMachineTranslation>({
    apiEndpoint: `${API_PATH}/ideas/${ideaId}/machine_translation`,
    ...streamParams,
  });
}

export function machineTranslationByCommentIdStream(
  commentId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IMachineTranslation>({
    apiEndpoint: `${API_PATH}/comments/${commentId}/machine_translation`,
    ...streamParams,
  });
}

export function machineTranslationByInitiativeIdStream(
  initiativeId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IMachineTranslation>({
    apiEndpoint: `${API_PATH}/initiatives/${initiativeId}/machine_translation`,
    ...streamParams,
  });
}
