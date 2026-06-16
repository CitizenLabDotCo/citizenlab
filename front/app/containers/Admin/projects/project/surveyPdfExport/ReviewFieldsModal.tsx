import React, { useEffect, useState } from 'react';

import {
  Box,
  Text,
  Title,
  Toggle,
  Button,
  Badge,
  CheckboxWithLabel,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import Modal from 'components/UI/Modal';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import { ContentMatch, ContentPiiType } from './contentScan';
import messages from './messages';
import { PiiField } from './piiDetection';

type Props = {
  opened: boolean;
  initialFields: PiiField[];
  contentMatches: ContentMatch[];
  responseCount: number;
  processing: boolean;
  onClose: () => void;
  onGenerate: (redactedKeys: Set<string>) => void;
};

const CONTENT_TYPE_MESSAGES: Record<
  ContentPiiType,
  (typeof messages)['contentTypeEmail']
> = {
  email: messages.contentTypeEmail,
  phone: messages.contentTypePhone,
  postcode: messages.contentTypePostcode,
};

const ReviewFieldsModal = ({
  opened,
  initialFields,
  contentMatches,
  responseCount,
  processing,
  onClose,
  onGenerate,
}: Props) => {
  const { formatMessage } = useIntl();
  const [fields, setFields] = useState<PiiField[]>(initialFields);
  const [consent, setConsent] = useState(false);

  // Reset the working copy each time the modal opens.
  useEffect(() => {
    if (opened) {
      setFields(initialFields);
      setConsent(false);
    }
  }, [opened, initialFields]);

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
                      <FormattedMessage
                        {...messages.detectedReason}
                        values={{ reason: field.reason }}
                      />
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

        {/* Content scanning */}
        {contentMatches.length > 0 && (
          <Box
            border={`1px solid ${colors.orange500}`}
            background={colors.orange100}
            borderRadius={stylingConsts.borderRadius}
            p="16px"
            mb="24px"
          >
            <Title variant="h6" as="h3" mt="0px" mb="4px">
              <FormattedMessage {...messages.contentScanTitle} />
            </Title>
            <Text fontSize="s" color="textSecondary" mt="0px" mb="12px">
              <FormattedMessage {...messages.contentScanDescription} />
            </Text>
            {contentMatches.map((match) => (
              <Box key={match.type} mb="8px">
                <Text m="0px" fontSize="xs" fontWeight="bold">
                  {formatMessage(CONTENT_TYPE_MESSAGES[match.type])} (
                  {match.values.length})
                </Text>
                <Box display="flex" flexWrap="wrap" gap="6px" mt="4px">
                  {match.values.map((value) => (
                    <Box
                      key={value}
                      px="8px"
                      py="2px"
                      background={colors.white}
                      border={`1px solid ${colors.borderLight}`}
                      borderRadius={stylingConsts.borderRadius}
                    >
                      <Text m="0px" fontSize="xs">
                        {value}
                      </Text>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        )}

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
      </Box>
    </Modal>
  );
};

export default ReviewFieldsModal;
