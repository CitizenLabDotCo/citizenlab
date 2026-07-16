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

const FooterNoteSuccessMessageIcon = styled(Icon)`
  margin-right: 4px;
`;

interface Props {
  codeResent: boolean;
  onResendCode: (e: FormEvent) => void;
  onChangePhone?: (e: FormEvent) => void;
}

const FooterNotes = ({ codeResent, onResendCode, onChangePhone }: Props) => (
  <>
    <FooterNote>
      <FormattedMessage {...messages.didntGetAnSMS} />

      {codeResent ? (
        <FooterNoteSuccessMessage data-cy="confirmation-code-sent-message">
          <FooterNoteSuccessMessageIcon name="check-circle" />
          <FormattedMessage {...messages.confirmationCodeSent} />
        </FooterNoteSuccessMessage>
      ) : (
        <FooterNoteLink onClick={onResendCode} data-cy="resend-code">
          <FormattedMessage {...messages.sendNewCode} />
        </FooterNoteLink>
      )}
    </FooterNote>
    {onChangePhone && (
      <FooterNote>
        <FormattedMessage {...messages.wrongNumber} />
        <FooterNoteLink onClick={onChangePhone}>
          <FormattedMessage {...messages.changeYourNumber} />
        </FooterNoteLink>
      </FooterNote>
    )}
  </>
);

export default FooterNotes;
