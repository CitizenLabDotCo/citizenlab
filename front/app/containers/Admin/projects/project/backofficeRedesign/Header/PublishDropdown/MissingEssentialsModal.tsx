import React from 'react';

import { Box, Button, Text, colors } from '@citizenlab/cl2-component-library';

import { IProjectData } from 'api/projects/types';

import ReadyMark from 'containers/Admin/projects/project/backofficeRedesign/ProjectSetupPanel/ReadyMark';
import {
  getMissingItems,
  SETUP_ITEMS,
} from 'containers/Admin/projects/project/backofficeRedesign/ProjectSetupPanel/setupItems';
import useSetupReadiness from 'containers/Admin/projects/project/backofficeRedesign/ProjectSetupPanel/useSetupReadiness';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

import usePublishNow from './usePublishNow';

interface Props {
  opened: boolean;
  project: IProjectData;
  onClose: () => void;
}

const MissingEssentialsModal = ({ opened, project, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const { publishNow, isPending } = usePublishNow(project);

  const missing = getMissingItems(useSetupReadiness(project).readiness);

  return (
    <Modal
      variant="bo"
      opened={opened}
      close={onClose}
      header={formatMessage(messages.publishMissingTitle)}
      footer={
        <Box display="flex" justifyContent="flex-end" gap="8px" w="100%">
          <Button
            buttonStyle="bo-secondary"
            onClick={onClose}
            disabled={isPending}
          >
            {formatMessage(messages.publishMissingBack)}
          </Button>
          <Button
            buttonStyle="bo-primary"
            processing={isPending}
            onClick={() => publishNow(onClose)}
            id="e2e-publish-anyway"
          >
            {formatMessage(messages.publishMissingConfirm)}
          </Button>
        </Box>
      }
    >
      <Box p="24px">
        <Text variant="boHelper" m="0" mb="24px">
          {formatMessage(messages.publishMissingBody, {
            missing: missing.length,
            total: SETUP_ITEMS.length,
          })}
        </Text>
        <Box role="list" borderTop={`1px solid ${colors.grey200}`}>
          {missing.map(({ key, label }) => (
            <Box
              role="listitem"
              key={key}
              display="flex"
              alignItems="center"
              gap="12px"
              py="10px"
              borderBottom={`1px solid ${colors.grey200}`}
            >
              <ReadyMark ready={false} />
              <Text variant="boControl" as="span" m="0">
                {formatMessage(label)}
              </Text>
            </Box>
          ))}
        </Box>
      </Box>
    </Modal>
  );
};

export default MissingEssentialsModal;
