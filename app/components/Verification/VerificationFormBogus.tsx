import React, { memo, useCallback, useState } from 'react';
import { get } from 'lodash-es';
import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { isNilOrError } from 'utils/helperUtils';

// components
import { Input } from 'cl2-component-library';
import Error from 'components/UI/Error';
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
} from './styles';

// hooks
import useAuthUser from 'hooks/useAuthUser';

// services
import { verifyBogus } from 'services/verify';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

interface Props {
  onCancel: () => void;
  onVerified: () => void;
  showHeader?: boolean;
  inModal: boolean;
  className?: string;
}

const VerificationFormBogus = memo<Props>(
  ({ onCancel, onVerified, showHeader, inModal, className }) => {
    const authUser = useAuthUser();

    const [desiredError, setDesiredError] = useState<string>('');
    const [desiredErrorError, setDesiredErrorError] = useState<string | null>(
      null
    );
    const [formError, setFormError] = useState<string | null>(null);

    const onDesiredErrorChange = useCallback((desiredError: string) => {
      setDesiredErrorError(null);
      setDesiredError(desiredError);
    }, []);

    const onSubmit = useCallback(
      async (event: React.FormEvent<HTMLButtonElement>) => {
        event.preventDefault();

        // first reset the errors
        setDesiredErrorError(null);
        setFormError(null);

        try {
          await verifyBogus(desiredError);

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

          onVerified();
        } catch (error) {
          if (get(error, 'json.errors.base[0].error') === 'taken') {
            setFormError('takenFormError');
          } else if (get(error, 'json.errors.base[0].error') === 'no_match') {
            setFormError('noMatchFormError');
          } else if (
            get(error, 'json.errors.base[0].error') === 'not_entitled'
          ) {
            setFormError('notEntitledFormError');
          } else if (
            get(error, 'json.errors.desired_error[0].error') === 'invalid'
          ) {
            setDesiredErrorError('Unkown desired error');
          }
        }
      },
      [desiredError, authUser, onVerified]
    );

    const onCancelButtonClicked = useCallback(() => {
      onCancel();
    }, [onCancel]);

    return (
      <FormContainer
        id="e2e-verification-bogus-form"
        className={className}
        inModal={inModal}
      >
        {showHeader && (
          <Title>
            <strong>Verify your identity (fake)</strong>
          </Title>
        )}

        <Form inModal={inModal}>
          <FormField>
            <StyledLabel>
              <LabelTextContainer>
                Desired error (taken, no_match, not_entitled or invalid)
              </LabelTextContainer>
              <Input
                id="e2e-verification-bogus-input"
                type="text"
                onChange={onDesiredErrorChange}
                value={desiredError}
                error={desiredErrorError}
              />
            </StyledLabel>
          </FormField>

          {formError && <Error text={formError} />}

          <Footer>
            <SubmitButton
              id="e2e-verification-bogus-submit-button"
              onClick={onSubmit}
            >
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

export default VerificationFormBogus;
