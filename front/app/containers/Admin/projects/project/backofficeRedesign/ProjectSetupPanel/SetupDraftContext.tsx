import React, { createContext, ReactNode, useContext } from 'react';

import { FieldPath, FieldPathValue, useForm } from 'react-hook-form';
import { Multiloc, UploadFile } from 'typings';

import useAddProjectImage from 'api/project_images/useAddProjectImage';
import useDeleteProjectImage from 'api/project_images/useDeleteProjectImage';
import useProjectImages from 'api/project_images/useProjectImages';
import useUpdateProjectImage from 'api/project_images/useUpdateProjectImage';
import { IProjectData } from 'api/projects/types';
import useUpdateProject from 'api/projects/useUpdateProject';

import { useRegisterPageSaver } from 'components/admin/PageSaveContext';
import { PROJECT_SETUP_SAVER_KEY } from 'components/admin/PageSaveContext/constants';

import markSaved from '../_shared/markSaved';

export interface ProjectDraftValues {
  area_ids: string[];
  include_all_areas: boolean;
  global_topic_ids: string[];
  description_preview_multiloc: Multiloc;
}

export interface PickedImage {
  file: UploadFile;
  cropped: string;
}

export interface ImageChanges {
  // `null` removes the saved image; no `image` keeps it.
  image?: PickedImage | null;
  altText?: Multiloc;
}

export const getProjectDraftValues = (
  project: IProjectData
): ProjectDraftValues => ({
  area_ids: project.relationships.areas.data.map((area) => area.id),
  include_all_areas: project.attributes.include_all_areas,
  global_topic_ids: project.relationships.global_topics.data.map(
    (topic) => topic.id
  ),
  description_preview_multiloc: project.attributes.description_preview_multiloc,
});

interface SetupDraftContextValue {
  values: ProjectDraftValues;
  imageChanges: ImageChanges;
  changeProject: <K extends FieldPath<ProjectDraftValues>>(
    name: K,
    value: FieldPathValue<ProjectDraftValues, K>
  ) => void;
  changeImage: <K extends FieldPath<ImageChanges>>(
    name: K,
    value: FieldPathValue<ImageChanges, K>
  ) => void;
  resetImage: () => void;
  saveFailed: boolean;
}

const SetupDraftContext = createContext<SetupDraftContextValue | null>(null);

interface Props {
  project: IProjectData;
  children: ReactNode;
}

// The setup cards change the project and its card image, and both are saved
// with the page.
export const SetupDraftProvider = ({ project, children }: Props) => {
  const projectId = project.id;
  const { data: images } = useProjectImages(projectId);
  const { mutateAsync: updateProject } = useUpdateProject();
  const { mutateAsync: addProjectImage } = useAddProjectImage();
  const { mutateAsync: updateProjectImage } = useUpdateProjectImage();
  const { mutateAsync: deleteProjectImage } = useDeleteProjectImage();

  const projectForm = useForm<ProjectDraftValues>({
    defaultValues: getProjectDraftValues(project),
  });
  const imageForm = useForm<ImageChanges>();

  const changeProject: SetupDraftContextValue['changeProject'] = (
    name,
    value
  ) => {
    projectForm.setValue(name, value, { shouldDirty: true });
    projectForm.clearErrors('root');
  };

  const changeImage: SetupDraftContextValue['changeImage'] = (name, value) => {
    imageForm.setValue(name, value, { shouldDirty: true });
    projectForm.clearErrors('root');
  };

  // Doesn't reuse useSyncProjectImages: that one sends the image again with an
  // alt text change, and runs add and delete in parallel.
  const saveImage = async ({ image, altText }: ImageChanges) => {
    const savedImageId = images?.data[0]?.id;

    if (image !== undefined) {
      // Add before delete, so a failed upload keeps the current image.
      if (image) {
        await addProjectImage({
          projectId,
          image: {
            image: image.cropped,
            ...(altText ? { alt_text_multiloc: altText } : {}),
          },
        });
      }
      if (savedImageId) {
        await deleteProjectImage({ projectId, imageId: savedImageId });
      }
    } else if (altText && savedImageId) {
      await updateProjectImage({
        projectId,
        imageId: savedImageId,
        image: { alt_text_multiloc: altText },
      });
    }
  };

  const save = async () => {
    const projectChanged = projectForm.formState.isDirty;
    const imageChanged = imageForm.formState.isDirty;
    // Copies, so edits made while saving don't change what was sent.
    const sentProject = { ...projectForm.getValues() };
    const sentImage = { ...imageForm.getValues() };
    projectForm.clearErrors('root');

    try {
      if (projectChanged) {
        await updateProject({ projectId, ...sentProject });
        markSaved(projectForm, sentProject);
      }
      if (imageChanged) {
        await saveImage(sentImage);
        // The saved image shows again, except where it was changed since.
        const { image, altText } = imageForm.getValues();
        imageForm.reset({});
        imageForm.reset(
          {
            ...(image !== sentImage.image && { image }),
            ...(altText !== sentImage.altText && { altText }),
          },
          { keepDefaultValues: true }
        );
      }
    } catch (error) {
      projectForm.setError('root', { type: 'server' });
      throw error;
    }
  };

  useRegisterPageSaver(PROJECT_SETUP_SAVER_KEY, {
    dirty: projectForm.formState.isDirty || imageForm.formState.isDirty,
    save,
  });

  const value: SetupDraftContextValue = {
    values: projectForm.watch(),
    imageChanges: imageForm.watch(),
    changeProject,
    changeImage,
    resetImage: () => imageForm.resetField('image'),
    saveFailed: !!projectForm.formState.errors.root,
  };

  return (
    <SetupDraftContext.Provider value={value}>
      {children}
    </SetupDraftContext.Provider>
  );
};

export const useOptionalSetupDraft = () => useContext(SetupDraftContext);

export const useSetupDraft = () => {
  const context = useContext(SetupDraftContext);
  if (!context) {
    throw new Error('useSetupDraft must be used inside SetupDraftProvider');
  }
  return context;
};
