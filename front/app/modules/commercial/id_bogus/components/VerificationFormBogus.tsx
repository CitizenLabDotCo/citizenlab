import React, { memo, useCallback, useState } from 'react';

import { Input } from '@citizenlab/cl2-component-library';
import { useQueryClient } from '@tanstack/react-query';
import { get } from 'lodash-es';

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
} from 'components/AuthProviderStyles/styles';
import Error from 'components/UI/Error';

import { isNilOrError } from 'utils/helperUtils';

import { verifyBogus } from '../api/verification_methods/verify';

interface Props {
  onCancel: () => void;
  onVerified: () => void;
  className?: string;
}

const VerificationFormBogus = memo<Props>(
  ({ onCancel, onVerified, className }) => {
    const { data: authUser } = useAuthUser();
    const queryClient = useQueryClient();
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

          if (!isNilOrError(authUser)) {
            queryClient.invalidateQueries(
              usersKeys.item({ id: authUser.data.id })
            );
          }

          queryClient.invalidateQueries({ queryKey: meKeys.all() });

          onVerified();
        } catch (error) {
          if (get(error, 'errors.base[0].error') === 'taken') {
            setFormError('takenFormError');
          } else if (get(error, 'errors.base[0].error') === 'no_match') {
            setFormError('noMatchFormError');
          } else if (get(error, 'errors.base[0].error') === 'not_entitled') {
            setFormError('notEntitledFormError');
          } else if (
            get(error, 'errors.desired_error[0].error') === 'invalid'
          ) {
            setDesiredErrorError('Unkown desired error');
          }
        }
      },
      [desiredError, authUser, onVerified, queryClient]
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
              buttonStyle="secondary-outlined"
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
