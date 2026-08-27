import React, { FormEvent } from 'react';

import { Icon, fontSizes, colors } from '@citizenlab/cl2-component-library';
import { darken } from 'polished';
import styled from 'styled-components';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

const FooterNote = styled.p`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.base}px;
  line-height: normal;

  &:not(:last-child) {
    margin: 0 0 1rem;
  }
`;

const FooterNoteLink = styled.button`
  font-size: ${fontSizes.base}px;
  padding-left: 4px;
  color: ${({ theme }) => theme.colors.tenantText};
  text-decoration: underline;

  &:hover {
    color: ${({ theme }) => darken(0.2, theme.colors.tenantText)};
    text-decoration: underline;
  }

  cursor: pointer;
`;

const FooterNoteSuccessMessage = styled.span`
  color: ${colors.success};
  padding-left: 6px;
`;

const FooterNoteCountdown = styled.span`
  color: ${({ theme }) => theme.colors.tenantText};
  padding-left: 4px;
`;

const FooterNoteSuccessMessageIcon = styled(Icon)`
  margin-right: 4px;
`;

interface Props {
  codeResent: boolean;
  secondsUntilResend: number;
  onResendCode: (e: FormEvent) => void;
  onChangePhone?: (e: FormEvent) => void;
}

const FooterNotes = ({
  codeResent,
  secondsUntilResend,
  onResendCode,
  onChangePhone,
}: Props) => (
  <>
    <FooterNote>
      <FormattedMessage {...messages.didntGetAnSMS} />

      {/* The link only appears once the backend would accept a new code. */}
      {secondsUntilResend > 0 ? (
        <FooterNoteCountdown data-cy="resend-code-countdown">
          <FormattedMessage
            {...messages.sendNewCodeIn}
            values={{ seconds: secondsUntilResend }}
          />
        </FooterNoteCountdown>
      ) : (
        <FooterNoteLink onClick={onResendCode} data-cy="resend-code">
          <FormattedMessage {...messages.sendNewCode} />
        </FooterNoteLink>
      )}

      {/* The message says a code just went out, which is the very thing the
          countdown is measuring - so it goes when the countdown does. */}
      {codeResent && secondsUntilResend > 0 && (
        <FooterNoteSuccessMessage data-cy="confirmation-code-sent-message">
          <FooterNoteSuccessMessageIcon name="check-circle" />
          <FormattedMessage {...messages.confirmationCodeSent} />
        </FooterNoteSuccessMessage>
      )}
    </FooterNote>
    {onChangePhone && (
      <FooterNote>
        <FormattedMessage {...messages.wrongNumber} />
        <FooterNoteLink onClick={onChangePhone} data-cy="go-to-change-phone">
          <FormattedMessage {...messages.changeYourNumber} />
        </FooterNoteLink>
      </FooterNote>
    )}
  </>
);

export default FooterNotes;
