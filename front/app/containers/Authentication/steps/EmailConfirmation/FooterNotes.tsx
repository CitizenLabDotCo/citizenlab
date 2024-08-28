import React, { FormEvent } from 'react';

import { Icon, fontSizes, colors } from '@citizenlab/cl2-component-library';
import { darken } from 'polished';
import styled from 'styled-components';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

export const FooterNote = styled.p`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.base}px;
  line-height: normal;

  &:not(:last-child) {
    margin: 0 0 1rem;
  }
`;

export const FooterNoteLink = styled.button`
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
  onChangeEmail?: (e: FormEvent) => void;
}

const FooterNotes = ({ codeResent, onResendCode, onChangeEmail }: Props) => (
  <>
    <FooterNote>
      <FormattedMessage {...messages.didntGetAnEmail} />

      {codeResent ? (
        <FooterNoteSuccessMessage>
          <FooterNoteSuccessMessageIcon name="check-circle" />
          <FormattedMessage {...messages.confirmationCodeSent} />
        </FooterNoteSuccessMessage>
      ) : (
        <FooterNoteLink onClick={onResendCode}>
          <FormattedMessage {...messages.sendNewCode} />
        </FooterNoteLink>
      )}
    </FooterNote>
    {onChangeEmail && (
      <FooterNote>
        <FormattedMessage {...messages.wrongEmail} />
        <FooterNoteLink onClick={onChangeEmail} id="e2e-go-to-change-email">
          <FormattedMessage {...messages.changeYourEmail} />
        </FooterNoteLink>
      </FooterNote>
    )}
  </>
);

export default FooterNotes;
