import React, { memo, useCallback, useState } from 'react';
import { get } from 'lodash-es';
import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { isNilOrError } from 'utils/helperUtils';

// components
import { Input } from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';
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
import { verifyBogus } from '../services/verify';

// api
import { queryClient } from 'utils/cl-react-query/queryClient';
import projectsKeys from 'api/projects/keys';

interface Props {
  onCancel: () => void;
  onVerified: () => void;
  className?: string;
}

const VerificationFormBogus = memo<Props>(
  ({ onCancel, onVerified, className }) => {
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
      async (event: React.MouseEvent) => {
        event.preventDefault();

        // first reset the errors
        setDesiredErrorError(null);
        setFormError(null);

        try {
          await verifyBogus(desiredError);

          queryClient.invalidateQueries({ queryKey: projectsKeys.all() });

          const endpointsToRefetch = [`${API_PATH}/users/me`];
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
        inModal={true}
      >
        <Form inModal={true}>
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
              Submit
            </SubmitButton>
            <CancelButton
              onClick={onCancelButtonClicked}
              buttonStyle="secondary"
            >
              Cancel
            </CancelButton>
          </Footer>
        </Form>
      </FormContainer>
    );
  }
);

export default VerificationFormBogus;
