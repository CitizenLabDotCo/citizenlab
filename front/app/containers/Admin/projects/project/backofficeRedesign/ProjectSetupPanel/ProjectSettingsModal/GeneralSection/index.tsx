import React from 'react';

import { CLErrors, Multiloc } from 'typings';

import { SpaceAndFolderId } from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectContextSection/types';
import messages from 'containers/Admin/projects/project/backofficeRedesign/messages';

import BoSlugInput from 'components/admin/SlugInput/BoSlugInput';
import Error from 'components/UI/Error';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import SettingsSection from 'components/UI/SettingsModal/SettingsSection';
import SettingsSections from 'components/UI/SettingsModal/SettingsSections';

import { useIntl } from 'utils/cl-intl';

import ContextSection from './ContextSection';
import ResetSection from './ResetSection';

interface Props {
  projectId: string;
  titleMultiloc: Multiloc;
  spaceId: string | null;
  folderId: string | null;
  projectInRoot: boolean;
  contextError: boolean;
  slug: string;
  currentSlug: string;
  showSlugErrorMessage: boolean;
  apiErrors: CLErrors;
  onTitleChange: (titleMultiloc: Multiloc) => void;
  onContextChange: (spaceAndFolderId: SpaceAndFolderId) => void;
  onSlugChange: (slug: string) => void;
}

const GeneralSection = ({
  projectId,
  titleMultiloc,
  spaceId,
  folderId,
  projectInRoot,
  contextError,
  slug,
  currentSlug,
  showSlugErrorMessage,
  apiErrors,
  onTitleChange,
  onContextChange,
  onSlugChange,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <SettingsSections>
      <SettingsSection title={formatMessage(messages.settingsProjectName)}>
        <InputMultilocWithLocaleSwitcher
          id="project-title"
          type="text"
          variant="bo"
          ariaLabel={formatMessage(messages.settingsProjectName)}
          valueMultiloc={titleMultiloc}
          onChange={onTitleChange}
        />
        <Error apiErrors={apiErrors.title_multiloc} />
      </SettingsSection>
      <SettingsSection title={formatMessage(messages.settingsProjectUrl)}>
        <BoSlugInput
          slug={slug}
          pathnameWithoutSlug="projects"
          apiErrors={apiErrors}
          showSlugErrorMessage={showSlugErrorMessage}
          onSlugChange={onSlugChange}
          showSlugChangedWarning={slug !== currentSlug}
        />
      </SettingsSection>
      <ContextSection
        spaceId={spaceId}
        folderId={folderId}
        projectInRoot={projectInRoot}
        error={contextError}
        onChange={onContextChange}
      />
      <ResetSection projectId={projectId} />
    </SettingsSections>
  );
};

export default GeneralSection;
