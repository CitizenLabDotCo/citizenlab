import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useContextPickers from 'containers/Admin/projects/_shared/components/ProjectContextPickers/useContextPickers';
import contextMessages from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectContextSection/messages';
import { SpaceAndFolderId } from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectContextSection/types';
import { useCanEditProjectContext } from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectContextSection/utils';

import Error from 'components/UI/Error';
import SettingsSection from 'components/UI/SettingsModal/SettingsSection';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

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
  });

  if (!canEditProjectContext || !pickers) return null;

  const { spacePicker, folderPicker, approvalWarning } = pickers;

  const rows = [
    { label: contextMessages.spaceLabel, picker: spacePicker },
    { label: contextMessages.folderLabel, picker: folderPicker },
  ];

  return (
    <SettingsSection title={formatMessage(messages.settingsProjectContext)}>
      <Box display="flex" flexDirection="column" gap="8px">
        {rows.map(
          ({ label, picker }) =>
            picker && (
              <Box
                key={label.id}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap="16px"
                minHeight="28px"
              >
                <Text variant="boMicro" color="textPrimary" m="0px">
                  {formatMessage(label)}
                </Text>
                {picker}
              </Box>
            )
        )}
      </Box>
      {error && (
        <Error
          text={formatMessage(
            spacePicker
              ? contextMessages.canOnlyMoveToManagedSpaceOrFolder
              : contextMessages.canOnlyMoveToManagedFolder
          )}
        />
      )}
      {approvalWarning}
    </SettingsSection>
  );
};

export default ContextSection;
