// The picker itself: five cards, one per combination. Picking one closes the
// modal — there is no "save", because the choice *is* the edit.

import React from "react";

import {
  Box,
  Title,
  Text,
  Icon,
  colors,
} from "@citizenlab/cl2-component-library";
import styled from "styled-components";

import Modal from "components/UI/Modal";

import { useIntl } from "utils/cl-intl";

import {
  CONTACT_OPTIONS,
  Channel,
  ContactRequirement,
  unavailableReason,
} from "./constants";
import IconCluster from "./IconCluster";
import messages from "./messages";

// Two per row, so the five options fit without the modal scrolling. "Either
// one" is last and odd, so it takes the full width rather than sitting next to
// a gap — which also gives the new capability the emphasis it deserves.
const OptionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;

  & > :last-child {
    grid-column: 1 / -1;
  }
`;

// A card is a button, so hover/focus need real CSS — Box's inline styles can't
// express them.
const OptionCard = styled.button<{ selected: boolean; disabled: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  width: 100%;
  padding: 12px;
  text-align: left;
  border-radius: 8px;
  background: ${({ selected, disabled }) =>
    disabled ? colors.grey50 : selected ? colors.teal50 : colors.white};
  border: 1px solid
    ${({ selected, disabled }) =>
      disabled
        ? colors.borderLight
        : selected
        ? colors.teal400
        : colors.borderLight};
  box-shadow: ${({ selected }) =>
    selected ? `0 0 0 1px ${colors.teal400}` : "none"};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
  transition: border-color 120ms ease, background 120ms ease,
    box-shadow 120ms ease, transform 120ms ease;

  &:hover:not(:disabled) {
    border-color: ${colors.teal400};
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid ${colors.teal500};
    outline-offset: 2px;
  }
`;

// The check on the right: a filled tick when picked, an empty ring otherwise.
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

interface Props {
  opened: boolean;
  value: ContactRequirement;
  available: Record<Channel, boolean>;
  onChange: (next: ContactRequirement) => void;
  onClose: () => void;
}

const ContactRequirementModal = ({
  opened,
  value,
  available,
  onChange,
  onClose,
}: Props) => {
  const { formatMessage } = useIntl();

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
            const reason = unavailableReason(option, available);
            const disabled = reason !== null;
            const selected = option.key === value;

            return (
              <OptionCard
                key={option.key}
                type="button"
                selected={selected}
                disabled={disabled}
                onClick={() => {
                  if (disabled) return;
                  onChange(option.key);
                  onClose();
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
                    color={disabled ? "coolGrey500" : "primary"}
                  >
                    {formatMessage(option.title)}
                  </Text>
                  <Text as="span" m="0" fontSize="xs" color="coolGrey600">
                    {disabled
                      ? `${formatMessage(
                          messages.unavailable
                        )} — ${formatMessage(reason)}`
                      : formatMessage(option.description)}
                  </Text>
                </Box>
              </OptionCard>
            );
          })}
        </OptionGrid>
      </Box>
    </Modal>
  );
};

export default ContactRequirementModal;
