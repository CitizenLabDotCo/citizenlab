import React, { memo, useCallback, useState } from 'react';
import { isEmpty, get } from 'lodash-es';
import { reportError } from 'utils/loggingUtils';

// components
import Input from 'components/UI/Input';
import Label from 'components/UI/Label';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import InfoTooltip from 'components/UI/InfoTooltip';
import { Title } from './styles';

// services
import { verifyCOW } from 'services/verify';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Form = styled.form`
  width: 100%;
  max-width: 350px;
`;

const FormField = styled.div`
  margin-bottom: 20px;
`;

const Footer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const FooterInner = styled.div`
  width: 100%;
  max-width: 350px;
  padding-top: 20px;
  padding-bottom: 20px;
  display: flex;
`;

const StyledLabel = styled(Label)`
  display: flex;
  flex-direction: column;
`;

const LabelTextContainer = styled.div`
  display: inline-block;
  margin-bottom: 10px;
`;

const StyledInfoTooltip = styled(InfoTooltip)`
  margin-left: 2px;
`;

const SubmitButton = styled(Button)`
  margin-right: 10px;
`;

const CancelButton = styled(Button)``;

interface Props {
  onCancel: () => void;
  onVerified: () => void;
  className?: string;
}

const VerificationFormCOW = memo<Props>(({ onCancel, onVerified, className }) => {

  const [run, setRun] = useState<string>('');
  const [idSerial, setIdSerial] = useState<string>('');
  const [runError, setRunError] = useState<JSX.Element | null>(null);
  const [idError, setIdError] = useState<JSX.Element | null>(null);
  const [formError, setFormError] = useState<JSX.Element | null>(null);

  const onRunChange = useCallback((run: string) => {
    setRunError(null);
    setRun(run);
  }, []);

  const onIdSerialChange = useCallback((idSerial: string) => {
    setIdError(null);
    setIdSerial(idSerial);
  }, []);

  const onSubmit = useCallback(async (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    let hasEmptyFields = false;

    // first reset the errors
    setRunError(null);
    setIdError(null);
    setFormError(null);

    if (isEmpty(run)) {
      setRunError(<FormattedMessage {...messages.emptyFieldError} />);
      hasEmptyFields = true;
    }

    if (isEmpty(idSerial)) {
      setIdError(<FormattedMessage {...messages.emptyFieldError} />);
      hasEmptyFields = true;
    }

    if (!hasEmptyFields) {
      try {
        await verifyCOW(run, idSerial);
        onVerified();
      } catch (error) {

        if (get(error, 'json.errors.base[0].error') === 'taken') {
          setFormError(<FormattedMessage {...messages.takenFormError} />);
        } else if (get(error, 'json.errors.base[0].error') === 'no_match') {
          setFormError(<FormattedMessage {...messages.noMatchFormError} />);
        } else if (get(error, 'json.errors.base[0].error') === 'not_entitled') {
          setFormError(<FormattedMessage {...messages.notEntitledFormError} />);
        } else if (get(error, 'json.errors.run[0].error') === 'invalid') {
          setRunError(<FormattedMessage {...messages.invalidRunError} />);
        } else if (get(error, 'json.errors.id_serial[0].error') === 'invalid') {
          setIdError(<FormattedMessage {...messages.invalidIdSerialError} />);
        } else {
          reportError(error);
          setFormError(<FormattedMessage {...messages.somethingWentWrongError} />);
        }
      }
    }

  }, [run, idSerial]);

  const onCancelButtonClicked = useCallback(() => {
    onCancel();
  }, []);

  return (
    <Container className={className}>
      <Title>
        <FormattedMessage {...messages.verifyYourIdentity} />
      </Title>

      <Form>
        <FormField>
          <StyledLabel>
            <LabelTextContainer>
              <FormattedMessage {...messages.cowRunNumber} />
              <StyledInfoTooltip {...messages.cowRunNumberTooltip} />
            </LabelTextContainer>
            <Input
              type="text"
              placeholder="xx.xxx.xxx-x"
              onChange={onRunChange}
              value={run}
              error={runError}
            />
          </StyledLabel>
        </FormField>

        <FormField>
          <StyledLabel>
            <LabelTextContainer>
              <FormattedMessage {...messages.cowIdSerialNumber} />
              <StyledInfoTooltip {...messages.cowIdSerialNumberTooltip} />
            </LabelTextContainer>
            <Input
              type="text"
              placeholder="xxx.xxx.xxx"
              onChange={onIdSerialChange}
              value={idSerial}
              error={idError}
            />
          </StyledLabel>
        </FormField>

        {formError &&
          <Error text={formError} />
        }

        <Footer>
          <FooterInner>
            <SubmitButton onClick={onSubmit}>
              <FormattedMessage {...messages.submit} />
            </SubmitButton>
            <CancelButton onClick={onCancelButtonClicked} style="secondary">
              <FormattedMessage {...messages.cancel} />
            </CancelButton>
          </FooterInner>
        </Footer>
      </Form>
    </Container>
  );
});

export default VerificationFormCOW;
