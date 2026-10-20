import React, { useRef, useState } from 'react';

import { Box, Button, Text, bo } from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import { CLErrors } from 'typings';

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

import DiscardChangesModal from './DiscardChangesModal';
import GeneralSection from './GeneralSection';
import PerspectivesSection from './PerspectivesSection';
import ResourcesSection from './ResourcesSection';
import TagsSection from './TagsSection';
import useFilesDraft from './useFilesDraft';
import useTagsDraft from './useTagsDraft';

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
  const tagsDraft = useTagsDraft(projectId);
  const filesDraft = useFilesDraft(projectId);

  const [processing, setProcessing] = useState(false);
  // `processing` only updates on the next render, so a quick double click
  // would otherwise save twice.
  const savingRef = useRef(false);
  const [apiErrors, setApiErrors] = useState<CLErrors>({});
  const [projectAttributesDiff, setProjectAttributesDiff] =
    useState<IUpdatedProjectProperties>({});
  const [projectContextError, setProjectContextError] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);

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
    setProcessing(true);
    setSaveFailed(false);
    try {
      if (!isEmpty(projectAttributesDiff)) {
        await updateProject({ projectId, ...projectAttributesDiff });
      }

      queryClient.invalidateQueries({
        queryKey: projectsKeys.item({ slug: project.attributes.slug }),
      });

      setProjectAttributesDiff({});
      setApiErrors({});
      setProjectContextError(false);
    } catch (errors) {
      setApiErrors((errors as { errors: CLErrors }).errors);
      savingRef.current = false;
      setProcessing(false);
      return;
    }

    const [tagsSaved, filesSaved] = await Promise.all([
      tagsDraft.save(),
      filesDraft.save(),
    ]);

    savingRef.current = false;
    setProcessing(false);

    if (tagsSaved && filesSaved) {
      onClose();
    } else {
      setSaveFailed(true);
    }
  };

  const dirty =
    !isEmpty(projectAttributesDiff) || tagsDraft.dirty || filesDraft.dirty;

  const discard = () => {
    setProjectAttributesDiff({});
    setSlug(project.attributes.slug);
    setShowSlugErrorMessage(false);
    setProjectContextError(false);
    setApiErrors({});
    setSaveFailed(false);
    tagsDraft.reset();
    filesDraft.reset();
    setConfirmingDiscard(false);
    onClose();
  };

  const handleClose = () => {
    if (dirty) {
      setConfirmingDiscard(true);
    } else {
      discard();
    }
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
      content: <ResourcesSection projectId={projectId} draft={filesDraft} />,
    },
    {
      name: 'tags',
      group: messages.settingsInputsGroup,
      label: messages.settingsTags,
      icon: 'label',
      content: <TagsSection draft={tagsDraft} />,
    },
    ...(perspectivesActive
      ? [
          {
            name: 'perspectives',
            group: messages.settingsInputsGroup,
            label: messages.settingsPerspectives,
            icon: 'stars',
            content: (
              <PerspectivesSection
                enabled={projectAttrs.live_auto_input_topics_enabled}
                onChange={(live_auto_input_topics_enabled) =>
                  applyDiff({ live_auto_input_topics_enabled })
                }
              />
            ),
          } satisfies SettingsModalSection,
        ]
      : []),
  ];

  return (
    <>
      <SettingsModal
        opened={opened}
        close={handleClose}
        header={formatMessage(messages.settingsTitle)}
        sections={sections}
        footer={
          <Box display="flex" alignItems="center" gap="12px">
            {saveFailed && (
              <Text variant="boMicro" color="red600" m="0px">
                {formatMessage(messages.settingsSaveFailed)}
              </Text>
            )}
            <Button
              buttonStyle="bo-primary"
              width="auto"
              height={bo.buttonMedium.height}
              padding={bo.buttonMedium.padding}
              fontSize={bo.buttonMedium.fontSize}
              processing={processing}
              onClick={handleSave}
              id="e2e-project-settings-save"
            >
              {formatMessage(messages.settingsSave)}
            </Button>
          </Box>
        }
      />
      <DiscardChangesModal
        opened={confirmingDiscard}
        onKeepEditing={() => setConfirmingDiscard(false)}
        onDiscard={discard}
      />
    </>
  );
};

export default ProjectSettingsModal;
