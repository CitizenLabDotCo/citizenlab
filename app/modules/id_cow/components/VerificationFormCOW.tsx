import React, { memo, useCallback, useState } from 'react';
import { isEmpty, get } from 'lodash-es';
import { reportError } from 'utils/loggingUtils';
import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { isNilOrError } from 'utils/helperUtils';

// components
import { Input, IconTooltip } from 'cl2-component-library';
import Error from 'components/UI/Error';
import Collapse from 'components/UI/Collapse';
import {
  FormContainer,
  Title,
  Form,
  FormField,
  StyledLabel,
  LabelTextContainer,
  Footer,
  SubmitButton,
  CancelButton,
  HelpImage,
} from 'components/Verification/styles';

// hooks
import useAuthUser from 'hooks/useAuthUser';

// services
import { verifyCOW } from '../services/verify';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// images
import helpImage from './COWHelpImage.png';
import { IVerificationMethod } from 'services/verificationMethods';

interface Props {
  onCancel: () => void;
  onVerified: () => void;
  showHeader?: boolean;
  inModal: boolean;
  method: IVerificationMethod;
  className?: string;
}

const VerificationFormCOW = memo<Props & InjectedIntlProps>(
  ({ onCancel, onVerified, showHeader, inModal, className, intl }) => {
    const authUser = useAuthUser();

    const [run, setRun] = useState('');
    const [idSerial, setIdSerial] = useState('');
    const [runError, setRunError] = useState<string | null>(null);
    const [idError, setIdError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [showHelp, setShowHelp] = useState(false);
    const [processing, setProcessing] = useState(false);

    const onRunChange = useCallback((run: string) => {
      setRunError(null);
      setRun(run);
    }, []);

    const onIdSerialChange = useCallback((idSerial: string) => {
      setIdError(null);
      setIdSerial(idSerial);
    }, []);

    const onSubmit = useCallback(
      async (event: React.FormEvent<HTMLButtonElement>) => {
        event.preventDefault();

        const { formatMessage } = intl;
        let hasEmptyFields = false;

        // first reset the errors
        setRunError(null);
        setIdError(null);
        setFormError(null);

        if (isEmpty(run)) {
          setRunError(formatMessage(messages.emptyFieldError));
          hasEmptyFields = true;
        }

        if (isEmpty(idSerial)) {
          setIdError(formatMessage(messages.emptyFieldError));
          hasEmptyFields = true;
        }

        if (!hasEmptyFields && !processing) {
          try {
            setProcessing(true);

            await verifyCOW(run, idSerial);

            const endpointsToRefetch = [
              `${API_PATH}/users/me`,
              `${API_PATH}/projects`,
            ];
            const partialEndpointsToRefetch = [
              `${API_PATH}/projects/`,
              `${API_PATH}/ideas/`,
            ];

            if (!isNilOrError(authUser)) {
              endpointsToRefetch.push(`${API_PATH}/users/${authUser.id}`);
            }

            await streams.fetchAllWith({
              apiEndpoint: endpointsToRefetch,
              partialApiEndpoint: partialEndpointsToRefetch,
            });

            setProcessing(false);

            onVerified();
          } catch (error) {
            setProcessing(false);

            if (get(error, 'json.errors.base[0].error') === 'taken') {
              setFormError(formatMessage(messages.takenFormError));
            } else if (get(error, 'json.errors.base[0].error') === 'no_match') {
              setFormError(formatMessage(messages.noMatchFormError));
            } else if (
              get(error, 'json.errors.base[0].error') === 'not_entitled'
            ) {
              setFormError(formatMessage(messages.notEntitledFormError));
            } else if (get(error, 'json.errors.run[0].error') === 'invalid') {
              setRunError(formatMessage(messages.invalidRunError));
            } else if (
              get(error, 'json.errors.id_serial[0].error') === 'invalid'
            ) {
              setIdError(formatMessage(messages.invalidIdSerialError));
            } else {
              reportError(error);
              setFormError(formatMessage(messages.somethingWentWrongError));
            }
          }
        }
      },
      [run, idSerial, processing, intl]
    );

    const onCancelButtonClicked = useCallback(() => {
      onCancel();
    }, [onCancel]);

    const onToggleHelpButtonClick = useCallback(() => {
      setShowHelp((showHelp) => !showHelp);
    }, []);

    return (
      <FormContainer className={className} inModal={inModal}>
        {showHeader && (
          <Title>
            <strong>
              <FormattedMessage {...messages.verifyYourIdentity} />
            </strong>
          </Title>
        )}

        <Form inModal={inModal}>
          <FormField>
            <StyledLabel htmlFor="run">
              <LabelTextContainer>
                <span>RUN</span>
                <IconTooltip
                  maxTooltipWidth={200}
                  content="Ingrese su número de RUT, con puntos y guión. Ej: 11.222.333-4"
                />
              </LabelTextContainer>
              <Input
                id="run"
                type="text"
                placeholder="xx.xxx.xxx-x"
                onChange={onRunChange}
                value={run}
                error={runError}
              />
            </StyledLabel>
          </FormField>

          <FormField>
            <StyledLabel htmlFor="id-serial">
              <LabelTextContainer>
                <span>Número de Documento</span>
                <IconTooltip
                  maxTooltipWidth={200}
                  content="Ingrese el número de documento que se encuentra al frente de las cédulas y atrás en las cédulas antiguas. Ej: 111.222.333 en las cédulas nuevas o A012345678 en las cédulas antiguas."
                />
              </LabelTextContainer>
              <Input
                id="id-serial"
                type="text"
                onChange={onIdSerialChange}
                value={idSerial}
                error={idError}
              />
            </StyledLabel>

            <Collapse
              opened={showHelp}
              onToggle={onToggleHelpButtonClick}
              label={intl.formatMessage(messages.showCOWHelp)}
            >
              <HelpImage src={helpImage} alt="help" />
            </Collapse>
          </FormField>

          {formError && <Error text={formError} />}

          <Footer>
            <SubmitButton onClick={onSubmit} processing={processing}>
              <FormattedMessage {...messages.submit} />
            </SubmitButton>
            <CancelButton
              onClick={onCancelButtonClicked}
              buttonStyle="secondary"
            >
              <FormattedMessage {...messages.cancel} />
            </CancelButton>
          </Footer>
        </Form>
      </FormContainer>
    );
  }
);

export default injectIntl(VerificationFormCOW);
