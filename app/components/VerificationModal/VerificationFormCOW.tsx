import React, { memo, useCallback, useState } from 'react';
import { isEmpty, get } from 'lodash-es';
import { reportError } from 'utils/loggingUtils';
import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { isNilOrError } from 'utils/helperUtils';

// components
import Input from 'components/UI/Input';
import Label from 'components/UI/Label';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import IconTooltip from 'components/UI/IconTooltip';

import { Title } from './styles';

// hooks
import useAuthUser from 'hooks/useAuthUser';

// services
import { verifyCOW } from 'services/verify';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// image
const helpImage: string = require('./COWHelpImage.png');

// style
import styled from 'styled-components';
import { colors, media } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Form = styled.form`
  width: 100%;
  max-width: 350px;

  ${media.smallerThanMaxTablet`
    max-width: auto;
  `}
`;

const FormField = styled.div`
  width: 100%;
  margin-bottom: 20px;
`;

const StyledLabel = styled(Label)`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const LabelTextContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
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

const HelpImage = styled.img`
  width: 100%;
`;

const HelpButton = styled.button`
   margin: 0;
   padding: 0;
   color: ${colors.label};
   cursor: pointer;
`;

interface Props {
  onCancel: () => void;
  onVerified: () => void;
  className?: string;
}

const VerificationFormCOW = memo<Props>(({ onCancel, onVerified, className }) => {

  const authUser = useAuthUser();

  const [run, setRun] = useState<string>('');
  const [idSerial, setIdSerial] = useState<string>('');
  const [runError, setRunError] = useState<JSX.Element | null>(null);
  const [idError, setIdError] = useState<JSX.Element | null>(null);
  const [formError, setFormError] = useState<JSX.Element | null>(null);
  const [showHelp, setShowHelp] = useState<boolean>(false);

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

        const endpointsToRefetch = [`${API_PATH}/users/me`, `${API_PATH}/projects`];
        const partialEndpointsToRefetch = [`${API_PATH}/projects/`, `${API_PATH}/ideas/`];

        if (!isNilOrError(authUser)) {
          endpointsToRefetch.push(`${API_PATH}/users/${authUser.data.id}`);
        }

        await streams.fetchAllWith({
          apiEndpoint: endpointsToRefetch,
          partialApiEndpoint: partialEndpointsToRefetch
        });

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

  const onShowHelpButtonClick = useCallback(() => {
    setShowHelp(showHelp => !showHelp);
  }, []);

  const removeFocus = useCallback((event) => {
    event.preventDefault();
  }, []);

  return (
    <Container className={className}>
      <Title>
        <strong><FormattedMessage {...messages.verifyYourIdentity} /></strong>
      </Title>

      <Form>
        <FormField>
          <StyledLabel htmlFor="run">
            <LabelTextContainer>
              <span>RUN</span>
              <IconTooltip maxTooltipWidth={200} content="Ingrese su número de RUT, con puntos y guión. Ej: 11.222.333-4" />
            </LabelTextContainer>
            <div>
              <Input
                id="run"
                type="text"
                placeholder="xx.xxx.xxx-x"
                onChange={onRunChange}
                value={run}
                error={runError}
              />
            </div>
          </StyledLabel>
        </FormField>

        <FormField>
          <StyledLabel htmlFor="id-serial">
            <LabelTextContainer>
              <span>Número de Documento</span>
              <IconTooltip maxTooltipWidth={200} content="Ingrese el número de documento que se encuentra al frente de las cédulas y atrás en las cédulas antiguas. Ej: 111.222.333 en las cédulas nuevas o A012345678 en las cédulas antiguas." />
            </LabelTextContainer>
            <div>
              <Input
                id="id-serial"
                type="text"
                onChange={onIdSerialChange}
                value={idSerial}
                error={idError}
              />
            </div>
          </StyledLabel>
          <HelpButton onClick={onShowHelpButtonClick} onMouseDown={removeFocus} type="button">
          {showHelp
            ? (
              <HelpImage src={helpImage} alt="help" />
            )
            : (
              <FormattedMessage {...messages.showCOWHelp} />
            )
          }
          </HelpButton>
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
