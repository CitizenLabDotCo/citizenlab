import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { Multiloc, UploadFile } from 'typings';

import useAddProjectImage from 'api/project_images/useAddProjectImage';
import useDeleteProjectImage from 'api/project_images/useDeleteProjectImage';
import useProjectImages from 'api/project_images/useProjectImages';
import useUpdateProjectImage from 'api/project_images/useUpdateProjectImage';
import { IProjectData, IUpdatedProjectProperties } from 'api/projects/types';
import useUpdateProject from 'api/projects/useUpdateProject';

import { useRegisterPageSaver } from '../_shared/PageSaveContext';

export type ProjectChanges = Partial<
  Omit<IUpdatedProjectProperties, 'projectId'>
>;

export interface PickedImage {
  file: UploadFile;
  cropped: string;
}

export interface ImageChanges {
  // `null` removes the saved image; no `image` keeps it.
  image?: PickedImage | null;
  altText?: Multiloc;
}

// Drops what was sent, but keeps any edit made while the request ran.
const withoutSent = (current: object, sent: object) => {
  const sentValues = new Map(Object.entries(sent));
  return Object.fromEntries(
    Object.entries(current).filter(
      ([key, value]) => sentValues.get(key) !== value
    )
  );
};

export const getDraftValues = (
  project: IProjectData,
  changes: ProjectChanges
) => ({
  areaIds:
    changes.area_ids ?? project.relationships.areas.data.map((area) => area.id),
  includeAllAreas:
    changes.include_all_areas ?? project.attributes.include_all_areas,
  topicIds:
    changes.global_topic_ids ??
    project.relationships.global_topics.data.map((topic) => topic.id),
});

interface SetupDraftContextValue {
  changes: ProjectChanges;
  imageChanges: ImageChanges;
  saveFailed: boolean;
  changeProject: (changes: ProjectChanges) => void;
  changeImage: (changes: ImageChanges) => void;
  resetImage: () => void;
}

const SetupDraftContext = createContext<SetupDraftContextValue | null>(null);

interface Props {
  project: IProjectData;
  children: ReactNode;
}

export const SetupDraftProvider = ({ project, children }: Props) => {
  const projectId = project.id;
  const { data: images } = useProjectImages(projectId);
  const { mutateAsync: updateProject } = useUpdateProject();
  const { mutateAsync: addProjectImage } = useAddProjectImage();
  const { mutateAsync: updateProjectImage } = useUpdateProjectImage();
  const { mutateAsync: deleteProjectImage } = useDeleteProjectImage();

  const [changes, setChanges] = useState<ProjectChanges>({});
  const [imageChanges, setImageChanges] = useState<ImageChanges>({});
  const [saveFailed, setSaveFailed] = useState(false);

  const changeProject = useCallback((newChanges: ProjectChanges) => {
    setChanges((changes) => ({ ...changes, ...newChanges }));
    setSaveFailed(false);
  }, []);

  const changeImage = useCallback((newChanges: ImageChanges) => {
    setImageChanges((changes) => ({ ...changes, ...newChanges }));
    setSaveFailed(false);
  }, []);

  const resetImage = useCallback(() => {
    setImageChanges(({ image: _image, ...rest }) => rest);
  }, []);

  // Doesn't reuse useSyncProjectImages: that one sends the image again with an
  // alt text change, and runs add and delete in parallel.
  const saveImage = async (sent: ImageChanges) => {
    const savedImageId = images?.data[0]?.id;
    const { image, altText } = sent;

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
    const sentChanges = changes;
    const sentImageChanges = imageChanges;
    setSaveFailed(false);

    try {
      if (Object.keys(sentChanges).length > 0) {
        await updateProject({ projectId, ...sentChanges });
        setChanges((current) => withoutSent(current, sentChanges));
      }
      if (Object.keys(sentImageChanges).length > 0) {
        await saveImage(sentImageChanges);
        setImageChanges((current) => withoutSent(current, sentImageChanges));
      }
    } catch (error) {
      setSaveFailed(true);
      throw error;
    }
  };

  useRegisterPageSaver('project-setup', {
    dirty:
      Object.keys(changes).length > 0 || Object.keys(imageChanges).length > 0,
    save,
  });

  const value = useMemo(
    () => ({
      changes,
      imageChanges,
      saveFailed,
      changeProject,
      changeImage,
      resetImage,
    }),
    [changes, imageChanges, saveFailed, changeProject, changeImage, resetImage]
  );

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
