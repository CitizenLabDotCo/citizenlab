import React, { memo, useCallback, useState } from 'react';

import { Input, IconTooltip } from '@citizenlab/cl2-component-library';
import { useQueryClient } from '@tanstack/react-query';
import { isEmpty, get } from 'lodash-es';
import { WrappedComponentProps } from 'react-intl';

import meKeys from 'api/me/keys';
import useAuthUser from 'api/me/useAuthUser';
import usersKeys from 'api/users/keys';

import {
  FormContainer,
  Form,
  FormField,
  StyledLabel,
  LabelTextContainer,
  Footer,
  SubmitButton,
  CancelButton,
  HelpImage,
} from 'components/AuthProviderStyles/styles';
import Collapse from 'components/UI/Collapse';
import Error from 'components/UI/Error';

import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { reportError } from 'utils/loggingUtils';

import { verifyCOW } from '../api/verification_methods/verify';
import messages from '../messages';

import helpImage from './COWHelpImage.png';

interface Props {
  onCancel: () => void;
  onVerified: () => void;
  className?: string;
}

const VerificationFormCOW = memo<Props & WrappedComponentProps>(
  ({ onCancel, onVerified, className, intl }) => {
    const { data: authUser } = useAuthUser();
    const queryClient = useQueryClient();
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
      async (event: React.MouseEvent) => {
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

            if (!isNilOrError(authUser)) {
              queryClient.invalidateQueries(
                usersKeys.item({ id: authUser.data.id })
              );
            }

            queryClient.invalidateQueries({ queryKey: meKeys.all() });
            setProcessing(false);

            onVerified();
          } catch (error) {
            setProcessing(false);

            if (get(error, 'errors.base[0].error') === 'taken') {
              setFormError(formatMessage(messages.takenFormError));
            } else if (get(error, 'errors.base[0].error') === 'no_match') {
              setFormError(formatMessage(messages.noMatchFormError));
            } else if (get(error, 'errors.base[0].error') === 'not_entitled') {
              setFormError(formatMessage(messages.notEntitledFormError));
            } else if (get(error, 'errors.run[0].error') === 'invalid') {
              setRunError(formatMessage(messages.invalidRunError));
            } else if (get(error, 'errors.id_serial[0].error') === 'invalid') {
              setIdError(formatMessage(messages.invalidIdSerialError));
            } else {
              reportError(error);
              setFormError(formatMessage(messages.somethingWentWrongError));
            }
          }
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [run, idSerial, processing, intl]
    );

    const onCancelButtonClicked = useCallback(() => {
      onCancel();
    }, [onCancel]);

    const onToggleHelpButtonClick = useCallback(() => {
      setShowHelp((showHelp) => !showHelp);
    }, []);

    return (
      <FormContainer className={className} inModal={true}>
        <Form inModal={true}>
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
              <HelpImage
                src={helpImage}
                alt={intl.formatMessage(messages.helpImageAltText)}
              />
            </Collapse>
          </FormField>

          {formError && <Error text={formError} />}

          <Footer>
            <SubmitButton onClick={onSubmit} processing={processing}>
              <FormattedMessage {...messages.submit} />
            </SubmitButton>
            <CancelButton
              onClick={onCancelButtonClicked}
              buttonStyle="secondary-outlined"
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
