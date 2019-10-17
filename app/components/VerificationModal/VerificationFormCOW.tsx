import React, { memo, useCallback, useState } from 'react';
import { isEmpty, get } from 'lodash-es';

// components
import Input from 'components/UI/Input';
import Label from 'components/UI/Label';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import InfoTooltip from 'components/admin/InfoTooltip';
import { Title } from './styles';

// services
import { verifyCOW } from 'services/verify';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { FormattedHTMLMessage } from 'react-intl';

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

        if (get(error, 'errors.base[0].error') === 'taken') {
          setFormError(<FormattedMessage {...messages.takenFormError} />);
        } else if (get(error, 'errors.base[0].error') === 'no_match') {
          setFormError(<FormattedMessage {...messages.noMatchFormError} />);
        } else if (get(error, 'errors.base[0].error') === 'not_entitled') {
          setFormError(<FormattedMessage {...messages.notEntitledFormError} />);
        } else if (get(error, 'errors.run[0].error') === 'invalid') {
          setRunError(<FormattedMessage {...messages.invalidRunError} />);
        } else if (get(error, 'errors.id_serial[0].error') === 'invalid') {
          setIdError(<FormattedMessage {...messages.invalidIdSerialError} />);
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
        <FormattedHTMLMessage {...messages.verifyYourIdentityManually} />
      </Title>

      <Form>
        <FormField>
          <Label>
            <FormattedMessage {...messages.cowRunNumber} />
            <InfoTooltip {...messages.cowRunNumberTooltip} />
          </Label>
          <Input
            type="text"
            placeholder="RUN"
            onChange={onRunChange}
            value={run}
            error={runError}
          />
        </FormField>

        <FormField>
          <Label>
            <FormattedMessage {...messages.cowIdSerialNumber} />
            <InfoTooltip {...messages.cowIdSerialNumberTooltip} />
          </Label>
          <Input
            type="text"
            placeholder="ID Number"
            onChange={onIdSerialChange}
            value={idSerial}
            error={idError}
          />
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
