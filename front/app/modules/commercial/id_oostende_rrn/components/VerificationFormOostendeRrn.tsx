import React, { memo, useCallback, useState } from 'react';
import { isEmpty, get } from 'lodash-es';
import { reportError } from 'utils/loggingUtils';
import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { isNilOrError } from 'utils/helperUtils';

// components
import { Input, IconTooltip } from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';
import Collapse from 'components/UI/Collapse';
import {
  FormContainer,
  Form,
  FormField,
  StyledLabel,
  LabelTextContainer,
  Footer,
  SubmitButton,
  CancelButton,
} from 'containers/Authentication/steps/AuthProviders/styles';

// hooks
import useAuthUser from 'hooks/useAuthUser';

// services
import { verifyOostendeRrn } from '../services/verify';

// i18n
import { WrappedComponentProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// images
import { TVerificationMethod } from 'services/verificationMethods';

// api
import { useQueryClient } from '@tanstack/react-query';
import projectsKeys from 'api/projects/keys';

interface Props {
  onCancel: () => void;
  onVerified: () => void;
  method: TVerificationMethod;
  className?: string;
}

const VerificationFormOostendeRrn = memo<Props & WrappedComponentProps>(
  ({ onCancel, onVerified, className, intl }) => {
    const authUser = useAuthUser();
    const queryClient = useQueryClient();

    const [rrn, setRrn] = useState('');
    const [rrnError, setRrnError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [showHelp, setShowHelp] = useState(false);
    const [processing, setProcessing] = useState(false);

    const onRunChange = useCallback((rrn: string) => {
      setRrnError(null);
      setRrn(rrn);
    }, []);

    const onSubmit = useCallback(
      async (event: React.MouseEvent) => {
        event.preventDefault();

        const { formatMessage } = intl;
        let hasEmptyFields = false;

        // first reset the errors
        setRrnError(null);
        setFormError(null);

        if (isEmpty(rrn)) {
          setRrnError(formatMessage(messages.emptyFieldError));
          hasEmptyFields = true;
        }

        if (!hasEmptyFields && !processing) {
          try {
            setProcessing(true);

            await verifyOostendeRrn(rrn);

            queryClient.invalidateQueries({ queryKey: projectsKeys.lists() });

            const endpointsToRefetch = [
              `${API_PATH}/users/me`,
              `${API_PATH}/users/me/locked_attributes`,
              `${API_PATH}/users/custom_fields/schema`,
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
              get(error, 'json.errors.base[0].error') === 'not_entitled' &&
              get(error, 'json.errors.base[0].why') === 'too_young'
            ) {
              setFormError(
                formatMessage(messages.notEntitledTooYoungFormError)
              );
            } else if (
              get(error, 'json.errors.base[0].error') === 'not_entitled' &&
              get(error, 'json.errors.base[0].why') === 'lives_outside'
            ) {
              setFormError(
                formatMessage(messages.notEntitledLivesOutsideFormError)
              );
            } else if (get(error, 'json.errors.rrn[0].error') === 'invalid') {
              setRrnError(formatMessage(messages.invalidRrnError));
            } else {
              reportError(error);
              setFormError(formatMessage(messages.somethingWentWrongError));
            }
          }
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [rrn, processing, intl]
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
            <StyledLabel htmlFor="rrn">
              <LabelTextContainer>
                <span>
                  <FormattedMessage {...messages.rrnLabel} />
                </span>
                <IconTooltip
                  maxTooltipWidth={200}
                  content={<FormattedMessage {...messages.rrnTooltip} />}
                />
              </LabelTextContainer>
              <Input
                id="rrn"
                type="text"
                placeholder="xxxxxx-xxx.xx"
                onChange={onRunChange}
                value={rrn}
                error={rrnError}
              />
            </StyledLabel>
            <Collapse
              opened={showHelp}
              onToggle={onToggleHelpButtonClick}
              label={intl.formatMessage(messages.showOostendeRrnHelp)}
            >
              <FormattedMessage {...messages.oostendeRrnHelp} />
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

export default injectIntl(VerificationFormOostendeRrn);
