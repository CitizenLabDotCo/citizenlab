import { Multiloc, UploadFile } from 'typings';

import useAddProjectImage from 'api/project_images/useAddProjectImage';
import useDeleteProjectImage from 'api/project_images/useDeleteProjectImage';
import useUpdateProjectImage from 'api/project_images/useUpdateProjectImage';

interface Params {
  croppedProjectCardBase64: string | null;
  projectCardImageAltText: Multiloc | null;
  projectCardImageToUpdate: UploadFile | null;
  projectCardImageToRemove: UploadFile | null;
  projectId: string;
}

const useSyncProjectImages = () => {
  const { mutateAsync: addProjectImage } = useAddProjectImage();
  const { mutateAsync: updateProjectImage } = useUpdateProjectImage();
  const { mutateAsync: deleteProjectImage } = useDeleteProjectImage();

  return ({
    croppedProjectCardBase64,
    projectCardImageAltText,
    projectCardImageToUpdate,
    projectCardImageToRemove,
    projectId,
  }: Params) => {
    const cardImageToAddPromise = croppedProjectCardBase64
      ? addProjectImage({
          projectId,
          image: {
            image: croppedProjectCardBase64,
            ...(projectCardImageAltText
              ? { alt_text_multiloc: projectCardImageAltText }
              : {}),
          },
        })
      : null;

    const cardImageToUpdatePromise =
      projectCardImageToUpdate &&
      projectCardImageToUpdate.id &&
      projectCardImageAltText
        ? updateProjectImage({
            projectId,
            imageId: projectCardImageToUpdate.id,
            image: {
              image: projectCardImageToUpdate.base64,
              alt_text_multiloc: projectCardImageAltText,
            },
          })
        : null;

    const cardImageToRemovePromise = projectCardImageToRemove?.id
      ? deleteProjectImage({
          projectId,
          imageId: projectCardImageToRemove.id,
        })
      : null;

    return Promise.all([
      cardImageToAddPromise,
      cardImageToUpdatePromise,
      cardImageToRemovePromise,
    ]);
  };
};

export default useSyncProjectImages;
