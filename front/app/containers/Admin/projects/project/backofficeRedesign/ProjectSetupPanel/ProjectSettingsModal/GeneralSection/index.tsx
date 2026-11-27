import React from 'react';

import { CLErrors, Multiloc } from 'typings';

import { SpaceAndFolderId } from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectContextSection/types';
import SettingsSection from 'containers/Admin/projects/project/backofficeRedesign/_shared/components/SettingsModal/SettingsSection';
import SettingsSections from 'containers/Admin/projects/project/backofficeRedesign/_shared/components/SettingsModal/SettingsSections';
import SlugInput from 'containers/Admin/projects/project/backofficeRedesign/_shared/components/SlugInput';

import MultilocTextField from 'components/admin/MultilocFields/MultilocTextField';
import useApiErrorText from 'components/admin/MultilocFields/useApiErrorText';
import { LanguageGroupState } from 'components/admin/MultilocFields/useLanguageGroup';

import { useIntl } from 'utils/cl-intl';

import ContextSection from './ContextSection';
import messages from './messages';
import ResetSection from './ResetSection';
import 'design-system/tokens.css';

interface Props {
  projectId: string;
  titleMultiloc: Multiloc;
  titleGroup: LanguageGroupState;
  spaceId: string | null;
  folderId: string | null;
  projectInRoot: boolean;
  contextError: boolean;
  slug: string;
  showSlugErrorMessage: boolean;
  apiErrors: CLErrors;
  onTitleChange: (titleMultiloc: Multiloc) => void;
  onContextChange: (spaceAndFolderId: SpaceAndFolderId) => void;
  onSlugChange: (slug: string) => void;
}

const GeneralSection = ({
  projectId,
  titleMultiloc,
  titleGroup,
  spaceId,
  folderId,
  projectInRoot,
  contextError,
  slug,
  showSlugErrorMessage,
  apiErrors,
  onTitleChange,
  onContextChange,
  onSlugChange,
}: Props) => {
  const { formatMessage } = useIntl();
  const getApiErrorMessage = useApiErrorText();
  const titleLabel = formatMessage(messages.settingsProjectName);
  const titleError = getApiErrorMessage(
    apiErrors.title_multiloc,
    'title_multiloc'
  );

  return (
    <SettingsSections>
      <SettingsSection title={titleLabel}>
        <MultilocTextField
          id="project-title"
          group={titleGroup}
          aria-label={titleLabel}
          valueMultiloc={titleMultiloc}
          onChange={onTitleChange}
          errorMessage={titleError}
        />
      </SettingsSection>
      <SettingsSection title={formatMessage(messages.settingsProjectUrl)}>
        <SlugInput
          slug={slug}
          apiErrors={apiErrors}
          showSlugErrorMessage={showSlugErrorMessage}
          onSlugChange={onSlugChange}
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
