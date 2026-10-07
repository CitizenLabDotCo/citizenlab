import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import contextMessages from '../ProjectSetupForm/ProjectContextSection/messages';
import { SpaceAndFolderId } from '../ProjectSetupForm/ProjectContextSection/types';

import useContextPickers from './useContextPickers';

interface Props {
  spaceId: string | null;
  folderId: string | null;
  projectInRoot: boolean;
  onChange: (spaceAndFolderId: SpaceAndFolderId) => void;
}

const ProjectContextPickers = ({
  spaceId,
  folderId,
  projectInRoot,
  onChange,
}: Props) => {
  const { formatMessage } = useIntl();
  const pickers = useContextPickers({
    spaceId,
    folderId,
    projectInRoot,
    onChange,
  });

  if (!pickers) return null;

  const { spacePicker, folderPicker, approvalWarning } = pickers;

  return (
    <Box display="flex" flexDirection="column" gap="12px">
      <Box display="flex" flexWrap="wrap" alignItems="center" gap="24px">
        {spacePicker && (
          <Box display="flex" alignItems="center" gap="12px" minWidth="0">
            <Text as="span" variant="boLabel" m="0px">
              {formatMessage(contextMessages.spaceLabel)}
            </Text>
            {spacePicker}
          </Box>
        )}

        <Box display="flex" alignItems="center" gap="12px" minWidth="0">
          <Text as="span" variant="boLabel" m="0px">
            {formatMessage(contextMessages.folderLabel)}
          </Text>
          {folderPicker}
        </Box>
      </Box>

      {approvalWarning}
    </Box>
  );
};

export default ProjectContextPickers;
