import React, { useState, FormEvent } from 'react';
import { FormattedMessage } from 'utils/cl-intl';
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';
import messages from './messages';
import Error from 'components/UI/Error';
import { confirm, resendCode, IConfirmation } from 'services/confirmation';
import useAuthUser from 'hooks/useAuthUser';
import { isNilOrError } from 'utils/helperUtils';
import { CLErrors } from 'typings';
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';

import {
  Box,
  Icon,
  Input,
  Label,
  Success,
} from '@citizenlab/cl2-component-library';
import Link from 'utils/cl-router/Link';
import Button from 'components/UI/Button';
import { FormLabel } from 'components/UI/FormComponents';

const FormContainer = styled.div<{ inModal: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.inModal ? 'center' : 'stretch')};
  margin-bottom: 60px;
`;

const Form = styled.form<{ inModal: boolean }>`
  width: 100%;
  max-width: ${(props) => (props.inModal ? '380px' : 'unset')};
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin: 2rem 0;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const StyledLabel = styled(Label)`
  display: block;
  text-align: left;
`;

const Footer = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 10px;
`;

const SubmitButton = styled(Button)`
  width: 100%;
  margin: 0.75rem 0;
`;

const FooterNotes = styled.div`
  margin: 18px 0 0;
  text-align: center;
`;

const FooterNote = styled.p`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.s}px;
  line-height: normal;

  &:not(:last-child) {
    margin: 0 0 1rem;
  }
`;

const FooterNoteLink = styled(Link)`
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

type Props = { onCompleted: () => void };

const ConfirmationSignupStep = ({ onCompleted }: Props) => {
  const user = useAuthUser();
  const [confirmation, setConfirmation] = useState<IConfirmation>({
    code: null,
  });
  const [newEmail, setNewEmail] = useState<string | null>(null);
  const [apiErrors, setApiErrors] = useState<CLErrors>({});
  const [processing, setProcessing] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [codeResent, setCodeResent] = useState(false);

  if (isNilOrError(user)) {
    return null;
  }

  function handleCodeChange(code: string) {
    setApiErrors({});
    setConfirmation((prevConfirmation) => ({
      ...prevConfirmation,
      code,
    }));
  }

  function handleSubmitConfirmation() {
    setProcessing(true);

    confirm(confirmation)
      .then(() => {
        setApiErrors({});
        setProcessing(false);
        trackEventByName(tracks.signUpConfirmationStepCompleted);
        onCompleted();
      })
      .catch((errors) => {
        setApiErrors(errors);
        trackEventByName(tracks.signUpConfirmationStepFailed);
        setProcessing(false);
      });
  }

  function handleResendCode(e: FormEvent) {
    e.preventDefault();
    setProcessing(true);

    resendCode()
      .then(() => {
        setProcessing(false);
        setCodeResent(true);
        setApiErrors({});
      })
      .catch((errors) => {
        setApiErrors(errors);
        setProcessing(false);
      });
  }

  function handleEmailSubmit() {
    setProcessing(true);

    resendCode(newEmail)
      .then(() => {
        setProcessing(false);
        setChangingEmail(false);
        setApiErrors({});
        setCodeResent(false);
      })
      .catch((errors) => {
        setApiErrors(errors);
        setProcessing(false);
      });
  }

  function handleEmailChange(email: string) {
    setNewEmail(email);
  }

  function handleShowEmailInput(e: FormEvent) {
    e.preventDefault();
    setChangingEmail(true);
  }

  function handleBackToCode(e: FormEvent) {
    e.preventDefault();
    setChangingEmail(false);
  }

  const inModal = true;
  return (
    <FormContainer id="e2e-confirmation-form" inModal={inModal}>
      {changingEmail ? (
        <Form inModal={inModal} onSubmit={handleEmailSubmit}>
          <FormField>
            <FormLabel labelMessage={messages.email} htmlFor="email-code" />
            <Input
              id="email-code"
              type="email"
              autocomplete="email"
              value={newEmail}
              onChange={handleEmailChange}
            />
            {apiErrors.email && (
              <Error apiErrors={apiErrors.email} fieldName="email" />
            )}
          </FormField>

          <Footer>
            <SubmitButton
              id="e2e-confirmation-button"
              onClick={handleEmailSubmit}
              processing={processing}
            >
              <FormattedMessage {...messages.sendEmailWithCode} />
            </SubmitButton>
          </Footer>
          <FooterNotes>
            <FooterNote>
              <FormattedMessage {...messages.foundYourCode} />
              <FooterNoteLink onClick={handleBackToCode} to="#">
                <FormattedMessage {...messages.goBack} />
              </FooterNoteLink>
            </FooterNote>
          </FooterNotes>
        </Form>
      ) : (
        <Form inModal={inModal} onSubmit={handleSubmitConfirmation}>
          <FormField>
            <Box display="flex" alignItems="center" mb="20px">
              <Icon
                width="30px"
                height="30px"
                name="check-circle"
                fill={colors.success}
              />
              <Success
                text={
                  <FormattedMessage
                    {...messages.anExampleCodeHasBeenSent}
                    values={{
                      userEmail: <strong>{user.attributes.email}</strong>,
                    }}
                  />
                }
              />
            </Box>
            <StyledLabel htmlFor="e2e-confirmation-code-input">
              <FormattedMessage {...messages.codeInput} />
            </StyledLabel>
            <Input
              id="e2e-confirmation-code-input"
              type="text"
              value={confirmation.code}
              onChange={handleCodeChange}
            />
            {apiErrors.code && (
              <Error apiErrors={apiErrors.code} fieldName="confirmation_code" />
            )}
          </FormField>

          <Footer>
            <SubmitButton
              id="e2e-confirmation-button"
              onClick={handleSubmitConfirmation}
              processing={processing}
            >
              <FormattedMessage {...messages.verifyAndContinue} />
            </SubmitButton>
          </Footer>
          <FooterNotes>
            <FooterNote>
              <FormattedMessage {...messages.didntGetAnEmail} />

              {codeResent ? (
                <FooterNoteSuccessMessage>
                  <FooterNoteSuccessMessageIcon name="check-circle" />
                  <FormattedMessage {...messages.confirmationCodeSent} />
                </FooterNoteSuccessMessage>
              ) : (
                <FooterNoteLink onClick={handleResendCode} to="#">
                  <FormattedMessage {...messages.sendNewCode} />
                </FooterNoteLink>
              )}
            </FooterNote>
            <FooterNote>
              <FormattedMessage {...messages.wrongEmail} />
              <FooterNoteLink onClick={handleShowEmailInput} to="#">
                <FormattedMessage {...messages.changeYourEmail} />
              </FooterNoteLink>
            </FooterNote>
          </FooterNotes>
        </Form>
      )}
    </FormContainer>
  );
};

export default ConfirmationSignupStep;
