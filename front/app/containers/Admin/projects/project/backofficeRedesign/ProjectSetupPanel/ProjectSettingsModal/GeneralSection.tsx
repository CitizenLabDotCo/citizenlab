import React from 'react';

import { CLErrors } from 'typings';

import { SpaceAndFolderId } from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectContextSection/types';

import SlugInput from 'components/admin/SlugInput';
import SettingsSection from 'components/UI/SettingsModal/SettingsSection';
import SettingsSections from 'components/UI/SettingsModal/SettingsSections';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

import ContextSection from './ContextSection';
import ResetSection from './ResetSection';

interface Props {
  projectId: string;
  spaceId: string | null;
  folderId: string | null;
  projectInRoot: boolean;
  contextError: boolean;
  slug: string;
  showSlugErrorMessage: boolean;
  apiErrors: CLErrors;
  onContextChange: (spaceAndFolderId: SpaceAndFolderId) => void;
  onSlugChange: (slug: string) => void;
}

const GeneralSection = ({
  projectId,
  spaceId,
  folderId,
  projectInRoot,
  contextError,
  slug,
  showSlugErrorMessage,
  apiErrors,
  onContextChange,
  onSlugChange,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <SettingsSections>
      <SettingsSection title={formatMessage(messages.settingsProjectUrl)}>
        <SlugInput
          variant="bo"
          slug={slug}
          pathnameWithoutSlug="projects"
          apiErrors={apiErrors}
          showSlugErrorMessage={showSlugErrorMessage}
          onSlugChange={onSlugChange}
          showSlugChangedWarning={false}
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
