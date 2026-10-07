import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useFiles from 'api/files/useFiles';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

interface Props {
  projectId: string;
}

const ResourcesSection = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const { data: files } = useFiles({ project: [projectId] });

  if (!files) return null;

  return (
    <Box>
      <Text variant="boSection" mb="8px">
        {formatMessage(messages.filesSection)}
      </Text>
      <Text variant="boHelper" mb="16px">
        {formatMessage(messages.filesDescription)}
      </Text>
      <Box display="flex" alignItems="center" gap="12px">
        <ButtonWithLink
          to="/admin/projects/$projectId/files"
          params={{ projectId }}
          buttonStyle="bo-secondary"
          icon="paperclip"
          width="auto"
        >
          {formatMessage(messages.addFiles)}
        </ButtonWithLink>
        <Text variant="boHelper" m="0">
          {files.data.length > 0
            ? formatMessage(messages.filesCount, { count: files.data.length })
            : formatMessage(messages.noAttachments)}
        </Text>
      </Box>
    </Box>
  );
};

export default ResourcesSection;
