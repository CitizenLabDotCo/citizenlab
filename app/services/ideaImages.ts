import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import request from 'utils/request';

export interface IIdeaImageData {
  id: string;
  type: string;
  attributes: {
    versions: {
      small: string;
      medium: string;
      large: string;
    };
    ordering: number;
    created_at: string;
    updated_at: string;
  };
}

export interface IIdeaImage {
  data: IIdeaImageData;
}

export interface IIdeaImages {
  data: IIdeaImageData[];
}

export function observeIdeaImage(ideaId: string, imageId: string, streamParams: IStreamParams<IIdeaImages> | null = null) {
  const apiEndpoint = `${API_PATH}/ideas/${ideaId}/images/${imageId}`;
  return streams.create<IIdeaImages>({ apiEndpoint, ...streamParams });
}

export function observeIdeaImages(ideaId: string, streamParams: IStreamParams<IIdeaImages> | null = null) {
  const apiEndpoint = `${API_PATH}/ideas/${ideaId}/images`;
  return streams.create<IIdeaImages>({ apiEndpoint, ...streamParams });
}

export function addIdeaImage(ideaId: string, base64: string, order: number | null = null) {
  const apiEndpoint = `${API_PATH}/ideas/${ideaId}/images`;
  const httpMethod = { method: 'POST' };
  const bodyData = {
    image: {
      order,
      image: base64,
    }
  };

  return request(apiEndpoint, bodyData, httpMethod, null).catch(() => {
    throw new Error(`error for addIdeaImage() of service IdeaImages`);
  });
}
