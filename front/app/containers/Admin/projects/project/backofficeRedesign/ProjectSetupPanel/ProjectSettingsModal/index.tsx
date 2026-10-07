import React, { useState } from 'react';

import { Box, Button, Divider } from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import { CLErrors } from 'typings';

import projectsKeys from 'api/projects/keys';
import { IProjectData, IUpdatedProjectProperties } from 'api/projects/types';
import useUpdateProject from 'api/projects/useUpdateProject';

import { SpaceAndFolderId } from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectContextSection/types';
import { useValidateProjectContext } from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectContextSection/utils';
import generalMessages from 'containers/Admin/projects/project/general/messages';
import ProjectInputTopics from 'containers/Admin/projects/project/topics';

import SettingsModal, {
  SettingsModalSection,
} from 'components/UI/SettingsModal';

import { useIntl } from 'utils/cl-intl';
import { queryClient } from 'utils/cl-react-query/queryClient';
import { validateSlug } from 'utils/textUtils';

import messages from '../../messages';

import GeneralSection from './GeneralSection';
import ManagementSection from './ManagementSection';
import ResetSection from './ResetSection';
import ResourcesSection from './ResourcesSection';

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

  const [processing, setProcessing] = useState(false);
  const [apiErrors, setApiErrors] = useState<CLErrors>({});
  const [projectAttributesDiff, setProjectAttributesDiff] =
    useState<IUpdatedProjectProperties>({});
  const [projectContextError, setProjectContextError] = useState(false);

  const [slug, setSlug] = useState(project.attributes.slug);
  const [showSlugErrorMessage, setShowSlugErrorMessage] = useState(false);

  const projectInRoot =
    !project.attributes.space_id && !project.attributes.folder_id;

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

      queryClient.invalidateQueries({
        queryKey: projectsKeys.item({ slug: project.attributes.slug }),
      });

      setProjectAttributesDiff({});
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
    onClose();
  };

  const sections: SettingsModalSection[] = [
    {
      name: 'general',
      label: messages.settingsGeneral,
      icon: 'settings',
      content: (
        <>
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
          <Divider />
          <ResetSection projectId={projectId} />
        </>
      ),
    },
    {
      name: 'resources',
      label: messages.settingsResources,
      icon: 'paperclip',
      content: <ResourcesSection projectId={projectId} />,
    },
    {
      name: 'management',
      label: messages.settingsManagement,
      icon: 'user',
      content: <ManagementSection projectId={projectId} />,
    },
    {
      name: 'input-tags',
      label: generalMessages.inputTags,
      icon: 'label',
      content: <ProjectInputTopics />,
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
            buttonStyle="bo-secondary"
            width="auto"
            onClick={handleCancel}
          >
            {formatMessage(messages.settingsCancel)}
          </Button>
          <Button
            buttonStyle="bo-primary"
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
