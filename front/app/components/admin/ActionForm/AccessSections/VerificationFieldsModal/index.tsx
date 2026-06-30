// Preview which fields the identity-verification method hands back, and which
// of them are locked (not editable by the participant). The fields and the
// method name come straight from the configured verification method's metadata.

import React from 'react';

import {
  Box,
  Title,
  Text,
  Icon,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import useVerificationMethod from 'api/id_methods/useVerificationMethod';

import useLocalize from 'hooks/useLocalize';

import Modal from 'components/UI/Modal';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  opened: boolean;
  onClose: () => void;
}

const VerificationFieldsModal = ({ opened, onClose }: Props) => {
  const localize = useLocalize();
  const { data: verificationMethod } = useVerificationMethod();

  const metadata = verificationMethod?.data.attributes.method_metadata;
  if (!metadata) return null;

  const methodName = metadata.name;
  // Locked fields come straight from the official register; the rest the
  // participant can still edit.
  const fields = [
    ...metadata.locked_attributes.map((m) => ({ label: localize(m), locked: true })),
    ...metadata.locked_custom_fields.map((m) => ({ label: localize(m), locked: true })),
    ...metadata.other_attributes.map((m) => ({ label: localize(m), locked: false })),
    ...metadata.other_custom_fields.map((m) => ({ label: localize(m), locked: false })),
  ];

  return (
    <Modal
      opened={opened}
      close={onClose}
      niceHeader
      width="480px"
      header={
        <Title ml="20px" variant="h3" color="primary">
          <FormattedMessage {...messages.fieldsReturnedByMethod} values={{ methodName }} />
        </Title>
      }
    >
      <Box p="24px">
        <Text mt="0" color="coolGrey600">
          <FormattedMessage
            {...messages.whenAParticipantVerifiesThroughMethod}
            values={{ methodName }}
          />
        </Text>

        <Box mt="12px">
          {fields.map((field) => (
            <Box
              key={field.label}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              py="10px"
              px="12px"
              mb="6px"
              borderRadius={stylingConsts.borderRadius}
              bgColor={colors.grey50}
            >
              <Text m="0" color="primary">
                {field.label}
              </Text>
              <Box display="flex" alignItems="center" gap="4px">
                <Icon
                  name={field.locked ? 'lock' : 'edit'}
                  width="14px"
                  height="14px"
                  fill={field.locked ? colors.coolGrey600 : colors.teal500}
                />
                <Text
                  m="0"
                  fontSize="xs"
                  color={field.locked ? 'coolGrey600' : 'teal500'}
                >
                  <FormattedMessage
                    {...(field.locked ? messages.locked : messages.editable)}
                  />
                </Text>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Modal>
  );
};

export default VerificationFieldsModal;
