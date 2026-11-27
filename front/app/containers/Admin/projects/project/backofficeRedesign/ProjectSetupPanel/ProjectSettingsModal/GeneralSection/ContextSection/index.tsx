import React from 'react';

import Banner from 'design-system/Banner';

import useContextPickers from 'containers/Admin/projects/_shared/components/ProjectContextPickers/useContextPickers';
import contextMessages from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectContextSection/messages';
import { SpaceAndFolderId } from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectContextSection/types';
import { useCanEditProjectContext } from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectContextSection/utils';
import SettingsSection from 'containers/Admin/projects/project/backofficeRedesign/_shared/components/SettingsModal/SettingsSection';

import { useIntl } from 'utils/cl-intl';

import styles from './ContextSection.module.css';
import messages from './messages';
import 'design-system/tokens.css';

interface Props {
  spaceId: string | null;
  folderId: string | null;
  projectInRoot: boolean;
  error: boolean;
  onChange: (spaceAndFolderId: SpaceAndFolderId) => void;
}

const ContextSection = ({
  spaceId,
  folderId,
  projectInRoot,
  error,
  onChange,
}: Props) => {
  const { formatMessage } = useIntl();
  const canEditProjectContext = useCanEditProjectContext();
  const pickers = useContextPickers({
    spaceId,
    folderId,
    projectInRoot,
    onChange,
    layout: 'inline',
  });

  if (!canEditProjectContext || !pickers) return null;

  const { spacePicker, folderPicker, approvalWarning } = pickers;

  return (
    <SettingsSection title={formatMessage(messages.settingsProjectContext)}>
      <div className={styles.rows}>
        {spacePicker}
        {folderPicker}
      </div>
      {error && (
        <div className={styles.error}>
          <Banner tone="error">
            {formatMessage(
              spacePicker
                ? contextMessages.canOnlyMoveToManagedSpaceOrFolder
                : contextMessages.canOnlyMoveToManagedFolder
            )}
          </Banner>
        </div>
      )}
      {approvalWarning}
    </SettingsSection>
  );
};

export default ContextSection;
