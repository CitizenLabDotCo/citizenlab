import React, { FormEvent } from 'react';

// components
import { Icon } from '@citizenlab/cl2-component-library';
import Link from 'utils/cl-router/Link';

// styling
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import { darken } from 'polished';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

export const FooterNote = styled.p`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.s}px;
  line-height: normal;

  &:not(:last-child) {
    margin: 0 0 1rem;
  }
`;

export const FooterNoteLink = styled(Link)`
  font-size: ${fontSizes.s}px;
  padding-left: 4px;
  color: ${({ theme }) => theme.colors.tenantText};
  text-decoration: underline;

  &:hover {
    color: ${({ theme }) => darken(0.2, theme.colors.tenantText)};
    text-decoration: underline;
  }
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
  onChangeEmail: (e: FormEvent) => void;
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
        <FooterNoteLink onClick={onResendCode} to="#">
          <FormattedMessage {...messages.sendNewCode} />
        </FooterNoteLink>
      )}
    </FooterNote>
    <FooterNote>
      <FormattedMessage {...messages.wrongEmail} />
      <FooterNoteLink onClick={onChangeEmail} to="#">
        <FormattedMessage {...messages.changeYourEmail} />
      </FooterNoteLink>
    </FooterNote>
  </>
);

export default FooterNotes;
