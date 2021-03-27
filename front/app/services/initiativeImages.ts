import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { initiativeByIdStream } from 'services/initiatives';
import { ImageSizes } from 'typings';

export interface IInitiativeImageData {
  id: string;
  type: string;
  attributes: {
    versions: ImageSizes;
    ordering: number;
    created_at: string;
    updated_at: string;
  };
}

export interface IInitiativeImage {
  data: IInitiativeImageData;
}

export interface IInitiativeImages {
  data: IInitiativeImageData[];
}

export function initiativeImageStream(initiativeId: string, imageId: string) {
  const apiEndpoint = `${API_PATH}/initiatives/${initiativeId}/images/${imageId}`;
  return streams.get<IInitiativeImage>({ apiEndpoint });
}

export function initiativeImagesStream(
  initiativeId: string,
  streamParams: IStreamParams | null = null
) {
  const apiEndpoint = `${API_PATH}/initiatives/${initiativeId}/images`;
  return streams.get<IInitiativeImages>({ apiEndpoint, ...streamParams });
}

export function deleteInitiativeImage(initiativeId: string, imageId: string) {
  return streams.delete(
    `${API_PATH}/initiatives/${initiativeId}/images/${imageId}`,
    imageId
  );
}

export async function addInitiativeImage(
  initiativeId: string,
  base64: string,
  ordering: number | null = null
) {
  const apiEndpoint = `${API_PATH}/initiatives/${initiativeId}/images`;
  const bodyData = {
    image: {
      ordering,
      image: base64,
    },
  };

  const initiativeImage = await streams.add<IInitiativeImage>(
    apiEndpoint,
    bodyData
  );
  await initiativeByIdStream(initiativeId).fetch();
  return initiativeImage;
}
