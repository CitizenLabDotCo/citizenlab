import React from 'react';

import {
  Box,
  Title,
  Text,
  Icon,
  IconNames,
  Button,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { EmailAndPhoneRequirements } from 'api/phase_permissions/types';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import { CHANNELS_IN_PLAY } from '../../../logic';
import { ContactChannel } from '../../../types';
import RecencyControl from '../../RecencyControl';

import { CONTACT_OPTIONS, ContactOption, unavailableReason } from './constants';
import IconCluster from './IconCluster';
import messages from './messages';

// Two per row, so the options fit without the modal scrolling.
const OptionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  align-items: start;
`;

const OptionCard = styled.button<{ $selected: boolean; disabled: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  width: 100%;
  padding: 12px;
  text-align: left;
  border-radius: 8px;
  background: ${({ $selected, disabled }) =>
    disabled ? colors.grey50 : $selected ? colors.teal50 : colors.white};
  border: 1px solid
    ${({ $selected, disabled }) =>
      disabled
        ? colors.borderLight
        : $selected
        ? colors.teal400
        : colors.borderLight};
  box-shadow: ${({ $selected }) =>
    $selected ? `0 0 0 1px ${colors.teal400}` : 'none'};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
  transition: border-color 120ms ease, background 120ms ease,
    box-shadow 120ms ease, transform 120ms ease;

  &:hover:not(:disabled) {
    border-color: ${colors.teal400};
  }

  &:focus-visible {
    outline: 2px solid ${colors.teal500};
    outline-offset: 2px;
  }
`;

const SelectionMark = ({ selected }: { selected: boolean }) =>
  selected ? (
    <Icon
      name="check-circle"
      width="18px"
      height="18px"
      fill={colors.teal500}
    />
  ) : (
    <Box
      w="16px"
      h="16px"
      borderRadius="50%"
      border={`1.5px solid ${colors.coolGrey300}`}
      flexShrink={0}
    />
  );

// The channel each recency row belongs to is shown as its glyph rather than a
// label on its own line - the same glyphs the IconCluster uses, so the row
// reads as "<email> + require recent confirmation" and stays on one line.
const CHANNEL_ICONS: Record<ContactChannel, IconNames> = {
  email: 'email',
  phone: 'tablet',
};

// Kept as the icon's accessible name, since the glyph replaces the visible label.
const CHANNEL_LABELS = {
  email: messages.emailRecency,
  phone: messages.phoneRecency,
} as const;

interface Props {
  opened: boolean;
  value: EmailAndPhoneRequirements;
  available: Record<ContactChannel, boolean>;
  verificationRequired: boolean;
  expiries: Record<ContactChannel, number | null>;
  onChange: (next: EmailAndPhoneRequirements) => void;
  onChangeExpiry: (channel: ContactChannel, expiry: number | null) => void;
  onClose: () => void;
}

const EmailAndPhoneRequirementsModal = ({
  opened,
  value,
  available,
  verificationRequired,
  expiries,
  onChange,
  onChangeExpiry,
  onClose,
}: Props) => {
  const { formatMessage } = useIntl();

  // Stops click/keyboard events from reaching the card, which would re-select
  // the option the control belongs to.
  const renderRecency = (option: ContactOption) => {
    const channels = CHANNELS_IN_PLAY[option.key];
    if (channels.length === 0) return null;

    return (
      <Box
        display="flex"
        flexDirection="column"
        gap="6px"
        mt="4px"
        pt="8px"
        borderTop={`1px solid ${colors.teal200}`}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        {channels.map((channel) => (
          <Box key={channel} display="flex" alignItems="center">
            {channels.length > 1 && (
              <Icon
                name={CHANNEL_ICONS[channel]}
                width="16px"
                height="16px"
                mr="8px"
                flexShrink={0}
                fill={colors.coolGrey600}
                ariaHidden={false}
                title={formatMessage(CHANNEL_LABELS[channel])}
              />
            )}
            <Box flex="1 1 auto" minWidth="0">
              <RecencyControl
                expiry={expiries[channel]}
                verb="Re-confirm"
                onChange={(expiry) => onChangeExpiry(channel, expiry)}
              />
            </Box>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Modal
      opened={opened}
      close={onClose}
      niceHeader
      width="620px"
      header={
        <Title ml="20px" variant="h3" color="primary">
          {formatMessage(messages.whatMustParticipantsConfirm)}
        </Title>
      }
    >
      <Box p="20px">
        <Text mt="0" mb="16px" fontSize="s" color="coolGrey600">
          {formatMessage(messages.modalIntro)}
        </Text>

        <OptionGrid>
          {CONTACT_OPTIONS.map((option) => {
            const reason = unavailableReason(
              option,
              available,
              verificationRequired
            );
            const disabled = reason !== null;
            const selected = option.key === value;

            return (
              <OptionCard
                key={option.key}
                type="button"
                data-testid={`contact-option-${option.key}`}
                $selected={selected}
                disabled={disabled}
                onClick={() => {
                  if (disabled) return;
                  onChange(option.key);
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  gap="8px"
                >
                  <IconCluster
                    option={option}
                    size="compact"
                    active={selected}
                    muted={disabled}
                  />
                  {!disabled && <SelectionMark selected={selected} />}
                </Box>

                <Box display="flex" flexDirection="column" gap="3px">
                  <Text
                    as="span"
                    m="0"
                    fontSize="s"
                    fontWeight="bold"
                    color={disabled ? 'coolGrey500' : 'primary'}
                  >
                    {formatMessage(option.title)}
                  </Text>
                  <Text as="span" m="0" fontSize="xs" color="coolGrey600">
                    {disabled
                      ? formatMessage(messages.unavailableReason, {
                          reason: formatMessage(reason),
                        })
                      : formatMessage(option.description)}
                  </Text>
                </Box>

                {selected && renderRecency(option)}
              </OptionCard>
            );
          })}
        </OptionGrid>

        <Box display="flex" justifyContent="flex-end" mt="20px">
          <Button buttonStyle="primary" onClick={onClose}>
            {formatMessage(messages.done)}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EmailAndPhoneRequirementsModal;
