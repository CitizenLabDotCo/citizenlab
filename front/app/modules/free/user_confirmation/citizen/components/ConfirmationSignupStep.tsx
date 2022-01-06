import React, { useEffect, useState } from 'react';
import { CONFIRMATION_STEP_NAME } from '../../index';
import { SignUpStepOutletProps } from 'utils/moduleUtils';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';
import messages from './messages';
import Error from 'components/UI/Error';
import {
  confirm,
  resendCode,
  IConfirmation,
} from '../../services/confirmation';
import useAuthUser, { TAuthUser } from 'hooks/useAuthUser';
import { isNilOrError } from 'utils/helperUtils';
import { CLErrors, CLError } from 'typings';
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';

import { Icon, Input, Label } from '@citizenlab/cl2-component-library';
import Link from 'utils/cl-router/Link';
import Button from 'components/UI/Button';

export const FormContainer = styled.div<{ inModal: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.inModal ? 'center' : 'stretch')};
  margin-bottom: 60px;
`;

export const Form = styled.form<{ inModal: boolean }>`
  width: 100%;
  max-width: ${(props) => (props.inModal ? '380px' : 'unset')};
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin: 2rem 0;
`;

export const FormField = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

export const StyledLabel = styled(Label)`
  display: block;
  text-align: center;
`;

export const LabelTextContainer = styled.div`
  display: block;
  color: ${({ theme }) => theme.colorText};
  margin-bottom: 1.5rem;
  font-size: ${fontSizes.base};

  &:last-child {
    margin-bottom: 1rem;
  }
`;

export const Footer = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 10px;
`;

export const SubmitButton = styled(Button)`
  width: 100%;
  margin: 0.75rem 0;
`;

const FooterNotes = styled.div`
  margin: 18px 0 0;
  text-align: center;
`;

const FooterNote = styled.p`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.small}px;
  line-height: normal;

  &:not(:last-child) {
    margin: 0 0 1rem;
  }
`;

const FooterNoteLink = styled(Link)`
  font-size: ${fontSizes.small}px;
  padding-left: 4px;
  color: ${({ theme }) => theme.colorText};
  text-decoration: underline;

  &:hover {
    color: ${({ theme }) => darken(0.2, theme.colorText)};
    text-decoration: underline;
  }
`;

const FooterNoteSuccessMessage = styled.span`
  color: ${colors.clGreen};
  padding-left: 6px;
`;

const FooterNoteSuccessMessageIcon = styled(Icon)`
  width: 12px;
  height: 12px;
  margin-right: 4px;
`;

type Props = SignUpStepOutletProps & InjectedIntlProps;

const isActive = (authUser: TAuthUser) => {
  return !isNilOrError(authUser) && authUser.attributes.confirmation_required;
};

const ConfirmationSignupStep = ({
  intl: { formatMessage },
  onCompleted,
  ...props
}: Props) => {
  const user = useAuthUser();
  const [confirmation, setConfirmation] = useState<IConfirmation>({
    code: null,
  });
  const [newEmail, setNewEmail] = useState<string | null | undefined>(
    undefined
  );
  const [apiErrors, setApiErrors] = useState<CLErrors>({});
  const [processing, setProcessing] = useState<boolean>(false);
  const [changingEmail, setChangingEmail] = useState<boolean>(false);
  const [codeResent, setCodeResent] = useState<boolean>(false);

  useEffect(() => {
    props.onData({
      key: CONFIRMATION_STEP_NAME,
      position: 4,
      stepDescriptionMessage: messages.confirmYourAccount,
      isEnabled: (authUser, __, { emailSignUpSelected }) => {
        if (emailSignUpSelected) return true;
        return isActive(authUser);
      },
      isActive,
      canTriggerRegistration: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (props.step !== CONFIRMATION_STEP_NAME || isNilOrError(user)) {
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

  function handleResendCode(e) {
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

  function handleEmailChange(email) {
    setNewEmail(email);
  }

  function handleShowEmailInput(e) {
    e.preventDefault();
    setChangingEmail(true);
  }

  function handleBackToCode(e) {
    e.preventDefault();
    setChangingEmail(false);
  }

  return (
    <FormContainer id="e2e-confirmation-form" inModal={true}>
      {changingEmail ? (
        <Form inModal={true} onSubmit={handleEmailSubmit}>
          <FormField>
            <StyledLabel>
              <LabelTextContainer>
                <FormattedMessage
                  {...messages.pleaseInsertYourNewEmail}
                  values={{ userEmail: user.attributes.email }}
                />
              </LabelTextContainer>
            </StyledLabel>
            <Input
              type="email"
              value={newEmail}
              onChange={handleEmailChange}
              placeholder={formatMessage(messages.emailPlaceholder)}
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
        <Form inModal={true} onSubmit={handleSubmitConfirmation}>
          <FormField>
            <StyledLabel>
              <LabelTextContainer>
                <FormattedMessage
                  {...messages.weAskEveryoneToConfirmTheirEmail}
                />
              </LabelTextContainer>
              <LabelTextContainer>
                <FormattedMessage
                  {...messages.anExampleCodeHasBeenSent}
                  values={{ userEmail: user.attributes.email }}
                />
              </LabelTextContainer>
            </StyledLabel>
            <Input
              id="e2e-confirmation-code-input"
              type="text"
              placeholder={formatMessage(messages.insertYour4DigitCodeHere)}
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
          <FooterNotes>
            <FooterNote>
              <FormattedMessage {...messages.didntGetAnEmail} />

              {codeResent ? (
                <FooterNoteSuccessMessage>
                  <FooterNoteSuccessMessageIcon name="checkmark-full" />
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

export default injectIntl(ConfirmationSignupStep);
