// Design prototype – preview which fields the identity-verification method
// hands back, and which of them are locked (not editable by the participant).

import React from 'react';

import {
  Box,
  Title,
  Text,
  Icon,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import Modal from 'components/UI/Modal';

import { VERIFICATION_RETURNED_FIELDS } from './data';

interface Props {
  opened: boolean;
  methodName: string;
  onClose: () => void;
}

const VerificationFieldsModal = ({ opened, methodName, onClose }: Props) => (
  <Modal
    opened={opened}
    close={onClose}
    niceHeader
    width="480px"
    header={
      <Title ml="20px" variant="h3" color="primary">
        Fields returned by {methodName}
      </Title>
    }
  >
    <Box p="24px">
      <Text mt="0" color="coolGrey600">
        When a participant verifies through {methodName}, these fields are filled
        in automatically. Locked fields come straight from the official register
        and can’t be changed by the participant.
      </Text>

      <Box mt="12px">
        {VERIFICATION_RETURNED_FIELDS.map((field) => (
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
                {field.locked ? 'Locked' : 'Editable'}
              </Text>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  </Modal>
);

export default VerificationFieldsModal;
