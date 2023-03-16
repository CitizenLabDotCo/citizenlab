import React, { useState, FormEvent } from 'react';

// services
import confirmEmail, { IConfirmation } from 'api/authentication/confirmEmail';
import resendEmailConfirmationCode from 'api/authentication/resendEmailConfirmationCode';

// hooks
import useAuthUser from 'hooks/useAuthUser';

// components
import Error from 'components/UI/Error';
import { Input, Label, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import { FormLabel } from 'components/UI/FormComponents';
import CodeSentMessage from './CodeSentMessage';
import FooterNotes, { FooterNote, FooterNoteLink } from './FooterNotes';

// styling
import styled from 'styled-components';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';
import { CLErrors, CLError } from 'typings';
import { isNilOrError } from 'utils/helperUtils';

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

type Props = { onCompleted: () => void };

const ConfirmationSignupStep = ({ onCompleted }: Props) => {
  const [confirmation, setConfirmation] = useState<IConfirmation>({
    code: null,
  });
  const [newEmail, setNewEmail] = useState<string | null>(null);
  const [apiErrors, setApiErrors] = useState<CLErrors>({});
  const [processing, setProcessing] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [codeResent, setCodeResent] = useState(false);

  const user = useAuthUser();
  if (isNilOrError(user)) return null;

  function handleCodeChange(code: string) {
    setApiErrors({});
    setConfirmation((prevConfirmation) => ({
      ...prevConfirmation,
      code,
    }));
  }

  function handleSubmitConfirmation() {
    setProcessing(true);

    confirmEmail(confirmation)
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

    resendEmailConfirmationCode()
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

    resendEmailConfirmationCode(newEmail ?? undefined)
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
              <Error
                apiErrors={apiErrors.email as CLError[]}
                fieldName="email"
              />
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
          <Text margin="18px 0 0" textAlign="center">
            <FooterNote>
              <FormattedMessage {...messages.foundYourCode} />
              <FooterNoteLink onClick={handleBackToCode}>
                <FormattedMessage {...messages.goBack} />
              </FooterNoteLink>
            </FooterNote>
          </Text>
        </Form>
      ) : (
        <Form inModal={inModal} onSubmit={handleSubmitConfirmation}>
          <FormField>
            <CodeSentMessage email={user.attributes.email} />
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
              <Error
                apiErrors={apiErrors.code as CLError[]}
                fieldName="confirmation_code"
              />
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
          <Text margin="18px 0 0" textAlign="center">
            <FooterNotes
              codeResent={codeResent}
              onResendCode={handleResendCode}
              onChangeEmail={handleShowEmailInput}
            />
          </Text>
        </Form>
      )}
    </FormContainer>
  );
};

export default ConfirmationSignupStep;
