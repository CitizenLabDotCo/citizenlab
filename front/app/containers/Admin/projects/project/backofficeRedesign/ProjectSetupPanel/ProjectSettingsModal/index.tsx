import React, { useRef, useState } from 'react';

import { isEmpty } from 'lodash-es';
import { CLErrors } from 'typings';

import Banner from 'design-system/Banner';

import { IProjectData, IUpdatedProjectProperties } from 'api/projects/types';
import useUpdateProject from 'api/projects/useUpdateProject';

import { SpaceAndFolderId } from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectContextSection/types';
import { useValidateProjectContext } from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectContextSection/utils';
import SettingsModal, {
  SettingsModalSection,
} from 'containers/Admin/projects/project/backofficeRedesign/_shared/components/SettingsModal';

import useLanguageGroup from 'components/admin/MultilocFields/useLanguageGroup';

import { useIntl } from 'utils/cl-intl';
import { validateSlug } from 'utils/textUtils';

import DiscardChangesModal from './DiscardChangesModal';
import GeneralSection from './GeneralSection';
import messages from './messages';
import ResourcesSection from './ResourcesSection';
import useFilesDraft from './ResourcesSection/useFilesDraft';
import 'design-system/tokens.css';

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
  const [section, setSection] = useState<string>();
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
  // Owned here, as the General section unmounts while another one shows.
  const titleGroup = useLanguageGroup(
    [
      {
        value: projectAttrs.title_multiloc,
        name: formatMessage(messages.projectNameField),
        required: true,
      },
    ],
    { ownCheck: true }
  );

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

    if (!titleGroup.check()) {
      setSection('general');
      return;
    }

    savingRef.current = true;
    setProcessing(true);
    setSaveFailed(false);
    try {
      if (!isEmpty(projectAttributesDiff)) {
        await updateProject({ projectId, ...projectAttributesDiff });
      }

      setProjectAttributesDiff({});
      setApiErrors({});
      setProjectContextError(false);
    } catch (errors) {
      setApiErrors((errors as { errors: CLErrors }).errors);
      savingRef.current = false;
      setProcessing(false);
      return;
    }

    const filesSaved = await filesDraft.save();

    savingRef.current = false;
    setProcessing(false);

    if (filesSaved) {
      onClose();
    } else {
      setSaveFailed(true);
    }
  };

  const dirty = !isEmpty(projectAttributesDiff) || filesDraft.dirty;

  const discard = () => {
    setProjectAttributesDiff({});
    setSlug(project.attributes.slug);
    setShowSlugErrorMessage(false);
    setProjectContextError(false);
    setApiErrors({});
    setSaveFailed(false);
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
      icon: 'settings-16',
      content: (
        <GeneralSection
          projectId={projectId}
          titleMultiloc={projectAttrs.title_multiloc}
          titleGroup={titleGroup}
          spaceId={projectAttrs.space_id ?? null}
          folderId={projectAttrs.folder_id ?? null}
          projectInRoot={projectInRoot}
          contextError={projectContextError}
          slug={slug}
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
      icon: 'paperclip-16',
      content: <ResourcesSection projectId={projectId} draft={filesDraft} />,
    },
  ];

  return (
    <>
      <SettingsModal
        opened={opened}
        close={handleClose}
        header={formatMessage(messages.settingsTitle)}
        sections={sections}
        section={section}
        onSectionChange={setSection}
        notice={
          saveFailed && (
            <Banner tone="error">
              {formatMessage(messages.settingsSaveFailed)}
            </Banner>
          )
        }
        primaryAction={{
          label: formatMessage(messages.settingsSave),
          onPress: handleSave,
          isPending: processing,
          id: 'e2e-project-settings-save',
        }}
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
