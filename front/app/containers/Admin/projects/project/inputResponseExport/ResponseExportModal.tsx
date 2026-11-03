import React, { ReactNode, useState } from 'react';

import {
  Box,
  Text,
  Button,
  CheckboxWithLabel,
} from '@citizenlab/cl2-component-library';

import Modal from 'components/UI/Modal';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import FieldRedactionList from './components/FieldRedactionList';
import messages from './messages';
import useFieldRedaction from './useFieldRedaction';

type Props = {
  phaseId: string;
  opened: boolean;
  onClose: () => void;
  title: JSX.Element | string;
  onGenerate: (options: { redactedFieldKeys: string[] }) => Promise<void>;
  // Extra export settings rendered above the field review (e.g. the PDF cover
  // form). When previewSlot is present the modal renders two columns.
  settingsSlot?: ReactNode;
  previewSlot?: ReactNode;
  // Progress/status of an async export, rendered in the footer above the
  // actions (e.g. the PDF export job progress bar).
  statusSlot?: ReactNode;
  // Disables the generate button beyond the modal's own conditions (e.g. while
  // an async export is running).
  generateDisabled?: boolean;
  // Close the modal after onGenerate resolves. Turn off for async exports,
  // where generating only starts a job whose progress is shown in statusSlot.
  closeOnGenerate?: boolean;
};

// The shared shell of the responses exports (PDF and XLSX): field review with
// PII flags, consent and the generate action. Format specifics come in via the
// slots and the onGenerate callback.
const ResponseExportModal = ({
  phaseId,
  opened,
  onClose,
  title,
  onGenerate,
  settingsSlot,
  previewSlot,
  statusSlot,
  generateDisabled = false,
  closeOnGenerate = true,
}: Props) => {
  const { formatMessage } = useIntl();

  const {
    fields,
    toggleField,
    setAllFields,
    redactedFieldKeys,
    isLoading,
    isError,
  } = useFieldRedaction(phaseId);

  const [consent, setConsent] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(false);
    try {
      await onGenerate({ redactedFieldKeys });
      if (closeOnGenerate) onClose();
    } catch {
      setError(true);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal
      opened={opened}
      close={onClose}
      width={previewSlot ? 1100 : 640}
      header={title}
      footer={
        // Consent lives in the fixed footer so it stays visible without
        // scrolling past the field list.
        <Box w="100%">
          {statusSlot}
          {error && (
            <Text color="red600" mt="0px" mb="8px" fontSize="s">
              <FormattedMessage {...messages.exportError} />
            </Text>
          )}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            gap="16px"
          >
            <Box
              flex="1 1 0"
              minWidth="0"
              data-cy="e2e-export-consent-checkbox"
            >
              <CheckboxWithLabel
                checked={consent}
                onChange={() => setConsent((prev) => !prev)}
                label={
                  <Text m="0px" fontSize="s" color="textSecondary">
                    {formatMessage(messages.consentLabel)}
                  </Text>
                }
              />
            </Box>
            <Box display="flex" gap="8px" flexShrink={0}>
              <Button buttonStyle="secondary-outlined" onClick={onClose}>
                <FormattedMessage {...messages.cancelButton} />
              </Button>
              <Button
                buttonStyle="admin-dark"
                icon="download"
                onClick={handleGenerate}
                processing={isGenerating}
                disabled={
                  !consent ||
                  isGenerating ||
                  isLoading ||
                  isError ||
                  generateDisabled
                }
                data-cy="e2e-generate-export-button"
              >
                <FormattedMessage {...messages.generateButton} />
              </Button>
            </Box>
          </Box>
        </Box>
      }
    >
      <Box display="flex" gap="32px" p="24px" h="70vh">
        {/* Left: settings + field review (scrolls; consent sits in the fixed footer) */}
        <Box flex="1 1 0" minWidth="0" h="100%" overflowY="auto" pr="8px">
          {settingsSlot}

          {isError ? (
            <Text color="red600" mt="0px" mb="16px" fontSize="s">
              <FormattedMessage {...messages.fieldsError} />
            </Text>
          ) : (
            <FieldRedactionList
              fields={fields}
              onToggleField={toggleField}
              onSetAllFields={setAllFields}
              isLoading={isLoading}
            />
          )}
        </Box>

        {previewSlot && (
          <Box
            flex="1 1 0"
            minWidth="0"
            h="100%"
            display="flex"
            flexDirection="column"
            gap="8px"
          >
            {previewSlot}
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default ResponseExportModal;
