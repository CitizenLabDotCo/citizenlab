import React from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';

import useFiles from 'api/files/useFiles';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import SettingsSection from 'components/UI/SettingsModal/SettingsSection';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

interface Props {
  projectId: string;
}

const ResourcesSection = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const { data: files } = useFiles({ project: [projectId] });

  if (!files) return null;

  const count = files.data.length;

  return (
    <SettingsSection
      title={formatMessage(messages.filesSection)}
      description={formatMessage(messages.filesDescription)}
      action={
        <ButtonWithLink
          to="/admin/projects/$projectId/files"
          params={{ projectId }}
          buttonStyle="bo-secondary"
          width="auto"
        >
          {formatMessage(count > 0 ? messages.manageFiles : messages.addFiles)}
        </ButtonWithLink>
      }
    >
      {count > 0 && (
        <Box
          display="inline-flex"
          alignItems="center"
          gap="4px"
          h="24px"
          px="8px"
          borderRadius="999px"
          background={colors.teal50}
        >
          <Icon
            name="paperclip"
            width="14px"
            height="14px"
            fill={colors.teal700}
          />
          <Text variant="boMicro" color="teal700" m="0px">
            {formatMessage(messages.filesCount, { count })}
          </Text>
        </Box>
      )}
    </SettingsSection>
  );
};

export default ResourcesSection;
