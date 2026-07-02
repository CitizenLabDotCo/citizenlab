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
  generateLabel: ReactNode;
  onGenerate: (options: { redactedFieldKeys: string[] }) => Promise<void>;
  // Extra export settings rendered above the field review (e.g. the PDF cover
  // form). When previewSlot is present the modal renders two columns.
  settingsSlot?: ReactNode;
  previewSlot?: ReactNode;
};

// The shared shell of the responses exports (PDF and XLSX): field review with
// PII flags, consent and the generate action. Format specifics come in via the
// slots and the onGenerate callback.
const ResponseExportModal = ({
  phaseId,
  opened,
  onClose,
  title,
  generateLabel,
  onGenerate,
  settingsSlot,
  previewSlot,
}: Props) => {
  const { formatMessage } = useIntl();

  const { fields, toggleField, redactedFieldKeys, isLoading, isError } =
    useFieldRedaction(phaseId);

  const [consent, setConsent] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(false);
    try {
      await onGenerate({ redactedFieldKeys });
      onClose();
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
        <Box display="flex" justifyContent="flex-end" gap="8px" w="100%">
          <Button buttonStyle="secondary-outlined" onClick={onClose}>
            <FormattedMessage {...messages.cancelButton} />
          </Button>
          <Button
            buttonStyle="admin-dark"
            icon="download"
            onClick={handleGenerate}
            processing={isGenerating}
            disabled={!consent || isGenerating || isLoading || isError}
          >
            {generateLabel}
          </Button>
        </Box>
      }
    >
      <Box display="flex" gap="32px" p="24px" h="70vh">
        {/* Left: settings + field review + consent (scrolls) */}
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
              isLoading={isLoading}
            />
          )}

          <CheckboxWithLabel
            checked={consent}
            onChange={() => setConsent((prev) => !prev)}
            label={
              <Text m="0px" fontSize="s" color="textSecondary">
                {formatMessage(messages.consentLabel)}
              </Text>
            }
          />

          {error && (
            <Text color="red600" mt="12px" mb="0px" fontSize="s">
              <FormattedMessage {...messages.exportError} />
            </Text>
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
