import React from 'react';

import { CLErrors, Multiloc } from 'typings';

import { SpaceAndFolderId } from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectContextSection/types';
import BoSlugInput from 'containers/Admin/projects/project/backofficeRedesign/_shared/components/BoSlugInput';
import SettingsSection from 'containers/Admin/projects/project/backofficeRedesign/_shared/components/SettingsModal/SettingsSection';
import SettingsSections from 'containers/Admin/projects/project/backofficeRedesign/_shared/components/SettingsModal/SettingsSections';

import Error from 'components/UI/Error';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';

import ContextSection from './ContextSection';
import messages from './messages';
import ParticipationDeviceSection from './ParticipationDeviceSection';
import ParticipationLocationSection from './ParticipationLocationSection';
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
  trackParticipationLocation: boolean;
  trackParticipationDevice: boolean;
  onTitleChange: (titleMultiloc: Multiloc) => void;
  onContextChange: (spaceAndFolderId: SpaceAndFolderId) => void;
  onSlugChange: (slug: string) => void;
  onTrackParticipationLocationChange: (enabled: boolean) => void;
  onTrackParticipationDeviceChange: (enabled: boolean) => void;
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
  trackParticipationLocation,
  trackParticipationDevice,
  onTitleChange,
  onContextChange,
  onSlugChange,
  onTrackParticipationLocationChange,
  onTrackParticipationDeviceChange,
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
      <ParticipationLocationSection
        enabled={trackParticipationLocation}
        onChange={onTrackParticipationLocationChange}
      />
      <ParticipationDeviceSection
        enabled={trackParticipationDevice}
        onChange={onTrackParticipationDeviceChange}
      />
      <ResetSection projectId={projectId} />
    </SettingsSections>
  );
};

export default GeneralSection;
