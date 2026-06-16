import React, { useEffect, useRef, useState } from 'react';

import {
  Box,
  Text,
  Toggle,
  Button,
  Badge,
  CheckboxWithLabel,
  colors,
} from '@citizenlab/cl2-component-library';

import Modal from 'components/UI/Modal';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

export type PiiField = {
  key: string;
  label: string;
  // A localized reason shown when the field is pre-flagged, or null.
  reason: string | null;
  redact: boolean;
};

type Props = {
  opened: boolean;
  initialFields: PiiField[];
  responseCount: number;
  processing: boolean;
  error: boolean;
  onClose: () => void;
  onGenerate: (redactedKeys: Set<string>) => void;
};

const ReviewFieldsModal = ({
  opened,
  initialFields,
  responseCount,
  processing,
  error,
  onClose,
  onGenerate,
}: Props) => {
  const { formatMessage } = useIntl();
  const [fields, setFields] = useState<PiiField[]>(initialFields);
  const [consent, setConsent] = useState(false);

  // Read the latest detected fields without making them an effect dependency,
  // so a background refetch of the form schema can't reset in-progress toggles.
  const initialFieldsRef = useRef(initialFields);
  initialFieldsRef.current = initialFields;

  // Reset the working copy only when the modal transitions to open.
  useEffect(() => {
    if (opened) {
      setFields(initialFieldsRef.current);
      setConsent(false);
    }
  }, [opened]);

  const flaggedCount = fields.filter((field) => field.redact).length;

  const toggleField = (key: string) =>
    setFields((prev) =>
      prev.map((field) =>
        field.key === key ? { ...field, redact: !field.redact } : field
      )
    );

  const handleGenerate = () => {
    const redactedKeys = new Set(
      fields.filter((field) => field.redact).map((field) => field.key)
    );
    onGenerate(redactedKeys);
  };

  return (
    <Modal
      opened={opened}
      close={onClose}
      width={600}
      header={<FormattedMessage {...messages.reviewModalTitle} />}
      footer={
        <Box display="flex" justifyContent="flex-end" gap="8px" w="100%">
          <Button buttonStyle="secondary-outlined" onClick={onClose}>
            <FormattedMessage {...messages.cancelButton} />
          </Button>
          <Button
            buttonStyle="admin-dark"
            icon="download"
            onClick={handleGenerate}
            processing={processing}
            disabled={!consent || processing}
          >
            <FormattedMessage {...messages.generateButton} />
          </Button>
        </Box>
      }
    >
      <Box p="24px">
        <Text color="textSecondary" mt="0px" mb="20px">
          <FormattedMessage
            {...messages.responsesFound}
            values={{ count: responseCount }}
          />{' '}
          {flaggedCount > 0 ? (
            <FormattedMessage
              {...messages.fieldReviewWithFlags}
              values={{ flaggedCount }}
            />
          ) : (
            <FormattedMessage {...messages.fieldReviewNoFlags} />
          )}
        </Text>

        {/* Field-level review */}
        <Box display="flex" flexDirection="column" mb="24px">
          {fields.map((field) => (
            <Box
              key={field.key}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap="12px"
              py="8px"
              borderTop={`1px solid ${colors.borderLight}`}
            >
              <Box display="flex" alignItems="center" gap="10px">
                <Toggle
                  checked={!field.redact}
                  onChange={() => toggleField(field.key)}
                />
                <Box>
                  <Text m="0px" fontWeight="bold">
                    {field.label}
                  </Text>
                  {field.reason && (
                    <Text m="0px" fontSize="xs" color="textSecondary">
                      {field.reason}
                    </Text>
                  )}
                </Box>
              </Box>
              <Badge
                color={field.redact ? colors.red600 : colors.success}
                className="inverse"
              >
                {field.redact
                  ? formatMessage(messages.excludeStatus)
                  : formatMessage(messages.includeStatus)}
              </Badge>
            </Box>
          ))}
        </Box>

        {/* Consent */}
        <CheckboxWithLabel
          checked={consent}
          onChange={() => setConsent((prev) => !prev)}
          label={
            <Text m="0px" fontSize="s">
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
    </Modal>
  );
};

export default ReviewFieldsModal;
