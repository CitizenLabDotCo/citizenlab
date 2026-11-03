import React from 'react';

import {
  Box,
  colors,
  fontSizes,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import TextareaAutosize from 'react-textarea-autosize';
import styled from 'styled-components';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

// Mirrors the limit of AIAssistant::Message on the backend.
const MAX_CONTENT_LENGTH = 5000;

// A chat-style input: one border around the text and the actions.
const Frame = styled.div`
  border: 1px solid ${colors.borderDark};
  border-radius: ${stylingConsts.borderRadius};
  background: ${colors.white};

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.tenantPrimary};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.tenantPrimary};
  }
`;

const PromptInput = styled(TextareaAutosize)`
  display: block;
  width: 100%;
  padding: 12px 12px 4px;
  border: none;
  outline: none;
  resize: none;
  background: transparent;
  color: ${colors.textPrimary};
  font-family: inherit;
  font-size: ${fontSizes.base}px;
  line-height: 1.5;

  // The Frame shows focus instead; the global white ring would hide its border.
  &.focus-visible,
  &:focus-visible {
    outline: none;
    box-shadow: none;
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

type Props = {
  prompt: string;
  disabled: boolean;
  sending: boolean;
  onPromptChange: (prompt: string) => void;
  onSend: () => void;
};

const Composer = ({
  prompt,
  disabled,
  sending,
  onPromptChange,
  onSend,
}: Props) => {
  const { formatMessage } = useIntl();

  const canSend = !disabled && prompt.trim() !== '';

  return (
    <Frame>
      <PromptInput
        value={prompt}
        onChange={(event) => onPromptChange(event.target.value)}
        placeholder={formatMessage(messages.placeholder)}
        aria-label={formatMessage(messages.placeholder)}
        minRows={3}
        maxRows={8}
        maxLength={MAX_CONTENT_LENGTH}
        disabled={disabled}
      />
      <Box display="flex" justifyContent="flex-end" p="8px">
        <ButtonWithLink
          type="button"
          icon="stars"
          size="s"
          onClick={onSend}
          disabled={!canSend}
          processing={sending}
        >
          <FormattedMessage {...messages.send} />
        </ButtonWithLink>
      </Box>
    </Frame>
  );
};

export default Composer;
