import React, { memo, useCallback, useState } from 'react';
import { get } from 'lodash-es';
import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { isNilOrError } from 'utils/helperUtils';

// components
import Input from 'components/UI/Input';
import Label from 'components/UI/Label';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import { Title } from './styles';

// hooks
import useAuthUser from 'hooks/useAuthUser';

// services
import { verifyBogus } from 'services/verify';

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

const SubmitButton = styled(Button)`
  margin-right: 10px;
`;

const CancelButton = styled(Button)``;

interface Props {
  onCancel: () => void;
  onVerified: () => void;
  className?: string;
}

const VerificationFormBogus = memo<Props>(({ onCancel, onVerified, className }) => {

  const authUser = useAuthUser();

  const [desiredError, setDesiredError] = useState<string>('');
  const [desiredErrorError, setDesiredErrorError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string| null>(null);

  const onDesiredErrorChange = useCallback((desiredError: string) => {
    setDesiredErrorError(null);
    setDesiredError(desiredError);
  }, []);

  const onSubmit = useCallback(async (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();

    // first reset the errors
    setDesiredErrorError(null);
    setFormError(null);

    try {
      await verifyBogus(desiredError);

      const endpointsToRefetch = [`${API_PATH}/users/me`, `${API_PATH}/projects`];
      const partialEndpointsToRefetch = [`${API_PATH}/projects/`];

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
        setFormError('takenFormError');
      } else if (get(error, 'json.errors.base[0].error') === 'no_match') {
        setFormError('noMatchFormError');
      } else if (get(error, 'json.errors.base[0].error') === 'not_entitled') {
        setFormError('notEntitledFormError');
      } else if (get(error, 'json.errors.desired_error[0].error') === 'invalid') {
        setDesiredErrorError('Unkown desired error');
      }
    }

  }, [desiredError, authUser]);

  const onCancelButtonClicked = useCallback(() => {
    onCancel();
  }, []);

  return (
    <Container className={className}>
      <Title>
        <strong>Verify your identity (fake)</strong>
      </Title>

      <Form>
        <FormField>
          <StyledLabel>
            <LabelTextContainer>
              Desired error (taken, no_match, not_entitled or invalid)
            </LabelTextContainer>
            <Input
              type="text"
              onChange={onDesiredErrorChange}
              value={desiredError}
              error={desiredErrorError}
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

export default VerificationFormBogus;
