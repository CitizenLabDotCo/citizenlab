import React, { FormEvent } from 'react';

// components
import { Icon } from '@citizenlab/cl2-component-library';

// styling
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import { darken } from 'polished';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

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
    {!isNilOrError(onChangeEmail) && (
      <FooterNote>
        <FormattedMessage {...messages.wrongEmail} />
        <FooterNoteLink onClick={onChangeEmail}>
          <FormattedMessage {...messages.changeYourEmail} />
        </FooterNoteLink>
      </FooterNote>
    )}
  </>
);

export default FooterNotes;
