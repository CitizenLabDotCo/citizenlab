import React, { useState } from 'react';

import {
  Box,
  Title,
  Text,
  Button,
  Radio,
} from '@citizenlab/cl2-component-library';

import useAiCreateProject from 'api/projects/useAiCreateProject';

import Modal from 'components/UI/Modal';
import TextArea from 'components/UI/TextArea';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

type ProjectCreationMode = 'ai' | 'manual';

interface Props {
  open: boolean;
  onClose: () => void;
  onManualMode: () => void;
  onAiProjectCreated: (projectId: string) => void;
}

const ProjectCreationModeModal = ({
  open,
  onClose,
  onManualMode,
  onAiProjectCreated,
}: Props) => {
  const { formatMessage } = useIntl();
  const [selectedMode, setSelectedMode] =
    useState<ProjectCreationMode>('manual');
  const [aiDescription, setAiDescription] = useState('');

  const { mutateAsync: createAiProject, isLoading: isCreatingAiProject } =
    useAiCreateProject();

  const handleContinue = async () => {
    if (selectedMode === 'manual') {
      onManualMode();
    } else {
      try {
        const result = await createAiProject({ description: aiDescription });
        const projectId = result.data.id;
        onAiProjectCreated(projectId);
      } catch (error) {
        // Error handling will be done by react-query
        console.error('Failed to create AI project:', error);
      }
    }
  };

  const handleModeChange = (mode: ProjectCreationMode) => {
    setSelectedMode(mode);
    if (mode === 'manual') {
      setAiDescription('');
    }
  };

  const isContinueDisabled =
    (selectedMode === 'ai' && aiDescription.trim().length === 0) ||
    isCreatingAiProject;

  return (
    <Modal width="600px" opened={open} close={onClose}>
      <Box p="32px">
        <Title variant="h2" color="primary" mb="16px">
          <FormattedMessage {...messages.title} />
        </Title>

        <Text color="textSecondary" mb="32px">
          <FormattedMessage {...messages.subtitle} />
        </Text>

        <Box mb="24px">
          <Box mb="16px">
            <Radio
              id="manual-mode"
              name="creation-mode"
              value="manual"
              currentValue={selectedMode}
              onChange={() => handleModeChange('manual')}
              label={
                <Box ml="8px">
                  <Text color="primary" fontWeight="bold" mb="4px">
                    <FormattedMessage {...messages.manualModeTitle} />
                  </Text>
                  <Text color="textSecondary" fontSize="s">
                    <FormattedMessage {...messages.manualModeDescription} />
                  </Text>
                </Box>
              }
            />
          </Box>

          <Box mb="16px">
            <Radio
              id="ai-mode"
              name="creation-mode"
              value="ai"
              currentValue={selectedMode}
              onChange={() => handleModeChange('ai')}
              label={
                <Box ml="8px">
                  <Text color="primary" fontWeight="bold" mb="4px">
                    <FormattedMessage {...messages.aiModeTitle} />
                  </Text>
                  <Text color="textSecondary" fontSize="s">
                    <FormattedMessage {...messages.aiModeDescription} />
                  </Text>
                </Box>
              }
            />
          </Box>
        </Box>

        {selectedMode === 'ai' && (
          <Box
            mb="32px"
            borderRadius="4px"
            border="1px solid #e0e0e0"
            p="16px"
            bg="background"
          >
            <Text color="primary" fontWeight="bold" mb="8px">
              <FormattedMessage {...messages.aiDescriptionLabel} />
            </Text>
            <TextArea
              id="ai-description"
              value={aiDescription}
              onChange={setAiDescription}
              placeholder={formatMessage(messages.aiDescriptionPlaceholder)}
              rows={4}
            />
            <Text color="textSecondary" fontSize="s" mt="8px">
              <FormattedMessage {...messages.aiDescriptionHint} />
            </Text>
          </Box>
        )}

        <Box display="flex" justifyContent="flex-end" gap="12px">
          <Button buttonStyle="secondary-outlined" onClick={onClose}>
            <FormattedMessage {...messages.cancel} />
          </Button>

          <Button
            buttonStyle="admin-dark"
            onClick={handleContinue}
            disabled={isContinueDisabled}
            processing={isCreatingAiProject}
          >
            <FormattedMessage {...messages.continue} />
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ProjectCreationModeModal;
