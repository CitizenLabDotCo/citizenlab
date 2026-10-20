import React, { useRef, useState } from 'react';

import { Box, Button, Tooltip, bo } from '@citizenlab/cl2-component-library';
import { useIsMutating } from '@tanstack/react-query';
import { isEmpty } from 'lodash-es';
import { CLErrors } from 'typings';

import filesKeys from 'api/files/keys';
import projectsKeys from 'api/projects/keys';
import { IProjectData, IUpdatedProjectProperties } from 'api/projects/types';
import useUpdateProject from 'api/projects/useUpdateProject';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { SpaceAndFolderId } from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectContextSection/types';
import { useValidateProjectContext } from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectContextSection/utils';
import messages from 'containers/Admin/projects/project/backofficeRedesign/messages';

import SettingsModal, {
  SettingsModalSection,
} from 'components/UI/SettingsModal';

import { useIntl } from 'utils/cl-intl';
import { queryClient } from 'utils/cl-react-query/queryClient';
import { validateSlug } from 'utils/textUtils';

import GeneralSection from './GeneralSection';
import PerspectivesSection from './PerspectivesSection';
import ResourcesSection from './ResourcesSection';
import TagsSection from './TagsSection';

interface Props {
  project: IProjectData;
  opened: boolean;
  onClose: () => void;
}

const ProjectSettingsModal = ({ project, opened, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const projectId = project.id;

  const { mutateAsync: updateProject } = useUpdateProject();
  const validateProjectContext = useValidateProjectContext();
  const perspectivesActive = useFeatureFlag({
    name: 'live_auto_input_topics',
  });
  const filesUploading = useIsMutating({ mutationKey: filesKeys.all() }) > 0;

  const [processing, setProcessing] = useState(false);
  // `processing` only updates on the next render, so a quick double click
  // would otherwise save twice.
  const savingRef = useRef(false);
  const [apiErrors, setApiErrors] = useState<CLErrors>({});
  const [projectAttributesDiff, setProjectAttributesDiff] =
    useState<IUpdatedProjectProperties>({});
  const [projectContextError, setProjectContextError] = useState(false);

  const [slug, setSlug] = useState(project.attributes.slug);
  const [showSlugErrorMessage, setShowSlugErrorMessage] = useState(false);

  const projectInRoot =
    !project.attributes.space_id && !project.attributes.folder_id;

  const applyDiff = (diff: IUpdatedProjectProperties) => {
    setProjectAttributesDiff((current) => ({ ...current, ...diff }));
    setApiErrors({});
  };

  const handleSlugChange = (nextSlug: string) => {
    applyDiff({ slug: nextSlug });
    setSlug(nextSlug);
    setShowSlugErrorMessage(!validateSlug(nextSlug));
  };

  const handleContextChange = (spaceAndFolderId: SpaceAndFolderId) => {
    applyDiff(spaceAndFolderId);
    setProjectContextError(false);
  };

  const projectAttrs = { ...project.attributes, ...projectAttributesDiff };

  const handleSave = async () => {
    if (savingRef.current) return;

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

    savingRef.current = true;
    try {
      setProcessing(true);

      if (!isEmpty(projectAttributesDiff)) {
        await updateProject({ projectId, ...projectAttributesDiff });
      }

      queryClient.invalidateQueries({
        queryKey: projectsKeys.item({ slug: project.attributes.slug }),
      });

      setProjectAttributesDiff({});
      setApiErrors({});
      setProjectContextError(false);
      onClose();
    } catch (errors) {
      setApiErrors((errors as { errors: CLErrors }).errors);
    } finally {
      savingRef.current = false;
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    setProjectAttributesDiff({});
    setSlug(project.attributes.slug);
    setShowSlugErrorMessage(false);
    setProjectContextError(false);
    setApiErrors({});
    onClose();
  };

  const sections: SettingsModalSection[] = [
    {
      name: 'general',
      group: messages.settingsProjectGroup,
      label: messages.settingsGeneral,
      icon: 'cog',
      content: (
        <GeneralSection
          projectId={projectId}
          titleMultiloc={projectAttrs.title_multiloc}
          spaceId={projectAttrs.space_id ?? null}
          folderId={projectAttrs.folder_id ?? null}
          projectInRoot={projectInRoot}
          contextError={projectContextError}
          slug={slug}
          currentSlug={project.attributes.slug}
          showSlugErrorMessage={showSlugErrorMessage}
          apiErrors={apiErrors}
          onTitleChange={(title_multiloc) => applyDiff({ title_multiloc })}
          onContextChange={handleContextChange}
          onSlugChange={handleSlugChange}
        />
      ),
    },
    {
      name: 'resources',
      group: messages.settingsProjectGroup,
      label: messages.settingsResources,
      icon: 'paperclip',
      content: <ResourcesSection projectId={projectId} />,
    },
    {
      name: 'tags',
      group: messages.settingsInputsGroup,
      label: messages.settingsTags,
      icon: 'label',
      content: <TagsSection projectId={projectId} />,
    },
    ...(perspectivesActive
      ? [
          {
            name: 'perspectives',
            group: messages.settingsInputsGroup,
            label: messages.settingsPerspectives,
            icon: 'stars',
            content: <PerspectivesSection projectId={projectId} />,
          } satisfies SettingsModalSection,
        ]
      : []),
  ];

  return (
    <SettingsModal
      opened={opened}
      close={handleCancel}
      header={formatMessage(messages.settingsTitle)}
      sections={sections}
      footer={
        <Tooltip
          content={formatMessage(messages.filesStillUploading)}
          disabled={!filesUploading}
          theme="dark"
          placement="top"
        >
          <Box>
            <Button
              buttonStyle="bo-primary"
              width="auto"
              height={bo.buttonMedium.height}
              padding={bo.buttonMedium.padding}
              fontSize={bo.buttonMedium.fontSize}
              processing={processing}
              disabled={filesUploading}
              onClick={handleSave}
              id="e2e-project-settings-save"
            >
              {formatMessage(messages.settingsSave)}
            </Button>
          </Box>
        </Tooltip>
      }
    />
  );
};

export default ProjectSettingsModal;
