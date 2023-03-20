import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { ImageSizes } from 'typings';
import { queryClient } from 'utils/cl-react-query/queryClient';
import ideasKeys from 'api/ideas/keys';

export interface IIdeaImageData {
  id: string;
  type: string;
  attributes: {
    versions: ImageSizes;
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

export function ideaImageStream(ideaId: string, imageId: string) {
  const apiEndpoint = `${API_PATH}/ideas/${ideaId}/images/${imageId}`;
  return streams.get<IIdeaImage>({ apiEndpoint });
}

export function ideaImagesStream(
  ideaId: string,
  streamParams: IStreamParams | null = null
) {
  const apiEndpoint = `${API_PATH}/ideas/${ideaId}/images`;
  return streams.get<IIdeaImages>({ apiEndpoint, ...streamParams });
}

export function deleteIdeaImage(ideaId: string, imageId: string) {
  return streams.delete(
    `${API_PATH}/ideas/${ideaId}/images/${imageId}`,
    imageId
  );
}

export async function addIdeaImage(
  ideaId: string,
  base64: string,
  ordering: number | null = null
) {
  const apiEndpoint = `${API_PATH}/ideas/${ideaId}/images`;
  const bodyData = {
    image: {
      ordering,
      image: base64,
    },
  };

  const ideaImage = await streams.add<IIdeaImage>(apiEndpoint, bodyData);
  queryClient.invalidateQueries(ideasKeys.item(ideaId));
  return ideaImage;
}
