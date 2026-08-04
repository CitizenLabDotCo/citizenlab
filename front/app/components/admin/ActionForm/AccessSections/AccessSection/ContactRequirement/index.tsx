// Replaces the separate "confirmed email" and "confirmed phone" toggles with a
// single choice. Two booleans can express three of the four combinations an
// admin might want, but not the important fourth one — "either an email address
// or a phone number, whichever they have" — so the two toggles become one
// select-like control with five states.

import React, { useState } from 'react';

import {
  Box,
  Text,
  Icon,
  IconTooltip,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { EmailAndPhoneRequirements } from 'api/phase_permissions/types';

import { useIntl } from 'utils/cl-intl';

import { ContactChannel } from '../../../types';

import { getOption } from './constants';
import ContactRequirementModal from './ContactRequirementModal';
import IconCluster from './IconCluster';
import messages from './messages';

const Trigger = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  /* Sized to its content: the control sits in a column of full-width rows, so
     shrinking it keeps it from reading as another one of them. */
  max-width: 100%;
  padding: 12px 14px;
  text-align: left;
  border-radius: 8px;
  border: 1px solid ${colors.borderLight};
  background: ${colors.white};
  cursor: pointer;
  transition: border-color 120ms ease, background 120ms ease;

  &:hover {
    border-color: ${colors.teal400};
    background: ${colors.teal50};
  }

  &:focus-visible {
    outline: 2px solid ${colors.teal500};
    outline-offset: 2px;
  }
`;

interface Props {
  value: EmailAndPhoneRequirements;
  available: Record<ContactChannel, boolean>;
  // "Nothing confirmed" is only offered when verification backs the account
  // instead — see unavailableReason in ./constants.
  verificationRequired: boolean;
  expiries: Record<ContactChannel, number | null>;
  onChange: (next: EmailAndPhoneRequirements) => void;
  onChangeExpiry: (channel: ContactChannel, expiry: number | null) => void;
}

const ContactRequirementControl = ({
  value,
  available,
  verificationRequired,
  expiries,
  onChange,
  onChangeExpiry,
}: Props) => {
  const { formatMessage } = useIntl();
  const [modalOpen, setModalOpen] = useState(false);
  const option = getOption(value);

  return (
    <Box py="10px">
      <Box display="flex" alignItems="center" gap="6px" mb="8px">
        <Text
          as="span"
          m="0"
          fontSize="s"
          fontWeight="semi-bold"
          color="primary"
        >
          {formatMessage(messages.contactDetails)}
        </Text>
        <IconTooltip
          content={formatMessage(messages.contactDetailsTooltip)}
          iconSize="14px"
        />
      </Box>

      <Trigger type="button" onClick={() => setModalOpen(true)}>
        <IconCluster
          option={option}
          size="large"
          active={value !== 'neither'}
        />

        <Box display="flex" flexDirection="column" gap="2px">
          <Text as="span" m="0" fontSize="s" fontWeight="bold" color="primary">
            {formatMessage(option.title)}
          </Text>
          <Text as="span" m="0" fontSize="xs" color="coolGrey600">
            {formatMessage(option.summary)}
          </Text>
        </Box>

        <Box display="flex" alignItems="center" gap="2px" flexShrink={0}>
          <Text
            as="span"
            m="0"
            fontSize="xs"
            fontWeight="semi-bold"
            color="teal500"
          >
            {formatMessage(messages.change)}
          </Text>
          <Icon
            name="chevron-right"
            width="16px"
            height="16px"
            fill={colors.teal500}
          />
        </Box>
      </Trigger>

      <ContactRequirementModal
        opened={modalOpen}
        value={value}
        available={available}
        verificationRequired={verificationRequired}
        expiries={expiries}
        onChange={onChange}
        onChangeExpiry={onChangeExpiry}
        onClose={() => setModalOpen(false)}
      />
    </Box>
  );
};

export default ContactRequirementControl;
