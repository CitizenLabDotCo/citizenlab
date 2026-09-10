import React, { useCallback, useEffect, useState } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import { CLErrors, Multiloc, UploadFile } from 'typings';

import useProjectImages from 'api/project_images/useProjectImages';
import projectsKeys from 'api/projects/keys';
import { IProjectData, IUpdatedProjectProperties } from 'api/projects/types';
import useUpdateProject from 'api/projects/useUpdateProject';

import { SpaceAndFolderId } from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectContextSection/types';
import { useValidateProjectContext } from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectContextSection/utils';
import useSyncProjectImages from 'containers/Admin/projects/_shared/useSyncProjectImages';
import { getSelectedTopicIds } from 'containers/Admin/projects/_shared/utils/getSelectedTopicIds';

import SettingsModal, {
  SettingsModalSection,
} from 'components/UI/SettingsModal';

import { useIntl } from 'utils/cl-intl';
import { queryClient } from 'utils/cl-react-query/queryClient';
import { convertUrlToUploadFile, isUploadFile } from 'utils/fileUtils';
import { validateSlug } from 'utils/textUtils';

import ProjectInputTopics from '../../../../topics';
import messages from '../../messages';

import FrontOfficeSection from './FrontOfficeSection';
import GeneralSection from './GeneralSection';
import ResetSection from './ResetSection';

interface Props {
  project: IProjectData;
  opened: boolean;
  onClose: () => void;
}

const ProjectSettingsModal = ({ project, opened, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const projectId = project.id;

  const { data: remoteProjectImages } = useProjectImages(projectId);
  const { mutateAsync: updateProject } = useUpdateProject();
  const syncProjectImages = useSyncProjectImages();
  const validateProjectContext = useValidateProjectContext();

  const [processing, setProcessing] = useState(false);
  const [apiErrors, setApiErrors] = useState<CLErrors>({});
  const [projectAttributesDiff, setProjectAttributesDiff] =
    useState<IUpdatedProjectProperties>({});
  const [projectContextError, setProjectContextError] = useState(false);

  const [slug, setSlug] = useState(project.attributes.slug);
  const [showSlugErrorMessage, setShowSlugErrorMessage] = useState(false);

  const [cardImage, setCardImage] = useState<UploadFile | null>(null);
  const [cardImageAltText, setCardImageAltText] = useState<Multiloc | null>(
    null
  );
  const [cardImageToRemove, setCardImageToRemove] = useState<UploadFile | null>(
    null
  );
  const [croppedCardBase64, setCroppedCardBase64] = useState<string | null>(
    null
  );

  const projectInRoot =
    !project.attributes.space_id && !project.attributes.folder_id;

  const loadRemoteCardImage = useCallback(async () => {
    setCardImage(null);
    setCardImageAltText(null);

    for (const projectImage of remoteProjectImages?.data ?? []) {
      const url = projectImage.attributes.versions.large;
      if (!url) continue;

      const uploadFile = await convertUrlToUploadFile(
        url,
        projectImage.id,
        null
      );
      if (isUploadFile(uploadFile)) {
        setCardImage(uploadFile);
        setCardImageAltText(projectImage.attributes.alt_text_multiloc);
        break;
      }
    }
  }, [remoteProjectImages]);

  useEffect(() => {
    loadRemoteCardImage();
  }, [loadRemoteCardImage]);

  const applyDiff = (diff: IUpdatedProjectProperties) =>
    setProjectAttributesDiff((current) => ({ ...current, ...diff }));

  const handleSlugChange = (nextSlug: string) => {
    applyDiff({ slug: nextSlug });
    setSlug(nextSlug);
    setShowSlugErrorMessage(!validateSlug(nextSlug));
  };

  const handleContextChange = (spaceAndFolderId: SpaceAndFolderId) => {
    applyDiff(spaceAndFolderId);
    setProjectContextError(false);
  };

  const handleCardImageAdd = (images: UploadFile[]) => {
    setCardImage(images[0]);
    setCroppedCardBase64(images[0].base64);
  };

  const handleCardImageRemove = (image: UploadFile) => {
    setCardImage(null);
    setCroppedCardBase64(null);
    if (image.remote) setCardImageToRemove(image);
  };

  const projectAttrs = { ...project.attributes, ...projectAttributesDiff };

  const handleSave = async () => {
    if (processing) return;

    if (
      !validateProjectContext({
        spaceId: projectAttrs.space_id,
        folderId: projectAttrs.folder_id,
        projectInRoot,
      })
    ) {
      setProjectContextError(true);
      return;
    }

    if (showSlugErrorMessage) return;

    try {
      setProcessing(true);

      if (!isEmpty(projectAttributesDiff)) {
        await updateProject({ projectId, ...projectAttributesDiff });
      }

      await syncProjectImages({
        croppedProjectCardBase64: croppedCardBase64,
        projectCardImageAltText: cardImageAltText,
        projectCardImageToUpdate: cardImage,
        projectCardImageToRemove: cardImageToRemove,
        projectId,
      });

      queryClient.invalidateQueries({
        queryKey: projectsKeys.item({ slug: project.attributes.slug }),
      });

      setProjectAttributesDiff({});
      setCardImageToRemove(null);
      setCroppedCardBase64(null);
      setProcessing(false);
      onClose();
    } catch (errors) {
      setApiErrors((errors as { errors: CLErrors }).errors);
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    setProjectAttributesDiff({});
    setSlug(project.attributes.slug);
    setShowSlugErrorMessage(false);
    setProjectContextError(false);
    setApiErrors({});
    setCardImageToRemove(null);
    setCroppedCardBase64(null);
    // The modal stays mounted between openings, so the card image the manager
    // edited has to be read back from the server to undo it.
    loadRemoteCardImage();
    onClose();
  };

  const sections: SettingsModalSection[] = [
    {
      name: 'front-office',
      label: messages.settingsFrontOffice,
      icon: 'globe',
      content: (
        <FrontOfficeSection
          selectedTopicIds={getSelectedTopicIds(projectAttributesDiff, project)}
          areaIds={projectAttrs.area_ids}
          cardImage={cardImage}
          cardImageAltText={cardImageAltText}
          cardImageShouldBeSaved={cardImage ? !cardImage.remote : false}
          onTopicsChange={(global_topic_ids) => applyDiff({ global_topic_ids })}
          onProjectAttributesDiffChange={applyDiff}
          onCardImageAdd={handleCardImageAdd}
          onCardImageRemove={handleCardImageRemove}
          onCardImageCropped={setCroppedCardBase64}
          onCardImageAltTextChange={setCardImageAltText}
        />
      ),
    },
    {
      name: 'general',
      label: messages.settingsGeneral,
      icon: 'settings',
      content: (
        <GeneralSection
          spaceId={projectAttrs.space_id}
          folderId={projectAttrs.folder_id}
          projectInRoot={projectInRoot}
          contextError={projectContextError}
          slug={slug}
          currentSlug={project.attributes.slug}
          showSlugErrorMessage={showSlugErrorMessage}
          apiErrors={apiErrors}
          onContextChange={handleContextChange}
          onSlugChange={handleSlugChange}
        />
      ),
    },
    {
      name: 'idea-tags',
      label: messages.settingsIdeaTags,
      icon: 'label',
      content: <ProjectInputTopics />,
    },
    {
      name: 'reset',
      label: messages.settingsReset,
      icon: 'refresh',
      content: <ResetSection projectId={projectId} />,
    },
  ];

  return (
    <SettingsModal
      opened={opened}
      close={handleCancel}
      header={formatMessage(messages.projectSettings)}
      sections={sections}
      footer={
        <Box display="flex" gap="8px">
          <Button
            buttonStyle="secondary-outlined"
            width="auto"
            onClick={handleCancel}
          >
            {formatMessage(messages.settingsCancel)}
          </Button>
          <Button
            buttonStyle="admin-dark"
            width="auto"
            processing={processing}
            onClick={handleSave}
            id="e2e-project-settings-save"
          >
            {formatMessage(messages.settingsSaveChanges)}
          </Button>
        </Box>
      }
    />
  );
};

export default ProjectSettingsModal;
