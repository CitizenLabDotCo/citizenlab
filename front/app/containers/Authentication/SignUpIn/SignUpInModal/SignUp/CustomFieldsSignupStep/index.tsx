import React, { FormEvent, FC, memo, useEffect, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { isObject } from 'lodash-es';

// components
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import { Spinner } from '@citizenlab/cl2-component-library';
import UserCustomFieldsForm from 'components/UserCustomFieldsForm';

// hooks
import useAuthUser from 'hooks/useAuthUser';
import useUserCustomFieldsSchema from 'hooks/useUserCustomFieldsSchema';

// i18n
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from '../messages';

// utils
import eventEmitter from 'utils/eventEmitter';
import { media } from 'utils/styleUtils';
// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';

const Loading = styled.div`
  padding-top: 15px;
`;

const Container = styled.div`
  padding-bottom: 30px;
  width: 100%;

  ${media.phone`
    padding-bottom: 15px;
  `}
`;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: -15px;

  ${media.phone`
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
  `}
`;

const SubmitButton = styled(Button)``;

const SkipButton = styled(Button)`
  ${media.phone`
    margin-top: 20px;
    margin-bottom: 15px;
  `}
`;

type InputProps = {
  onCompleted: (registrationData?: Record<string, any>) => void;
};

interface Props extends InputProps, WrappedComponentProps {}

const CustomFieldsStep: FC<Props & WrappedComponentProps> = memo(
  ({ intl: { formatMessage }, onCompleted }) => {
    const [processingSubmit, setProcessingSubmit] = useState(false);
    const [processingSkip, setProcessingSkip] = useState(false);
    const [unknownError, setUnknownError] = useState<string | null>();

    const authUser = useAuthUser();
    const userCustomFieldsSchema = useUserCustomFieldsSchema();

    useEffect(() => {
      trackEventByName(tracks.signUpCustomFieldsStepEntered);
      return () => {
        trackEventByName(tracks.signUpCustomFieldsStepExited);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleOnSubmitButtonClick = (event: FormEvent) => {
      event.preventDefault();
      eventEmitter.emit('customFieldsSubmitEvent');
    };

    const handleCustomFieldsFormOnSubmit = async ({ formData }) => {
      if (!isNilOrError(authUser) && isObject(formData)) {
        try {
          setProcessingSubmit(true);
          setUnknownError(null);
          onCompleted(formData);
          setProcessingSubmit(false);
          trackEventByName(tracks.signUpCustomFieldsStepCompleted);
        } catch (error) {
          trackEventByName(tracks.signUpCustomFieldsStepFailed, { error });
          setProcessingSubmit(false);
          setUnknownError(formatMessage(messages.unknownError));
        }
      }
    };

    const skipStep = (event: FormEvent) => {
      event.preventDefault();
      trackEventByName(tracks.signUpCustomFieldsStepSkipped);
      setProcessingSkip(true);
      onCompleted();
    };

    if (isNilOrError(authUser) || isNilOrError(userCustomFieldsSchema)) {
      return (
        <Loading>
          <Spinner />
        </Loading>
      );
    }

    if (!isNilOrError(authUser) && !isNilOrError(userCustomFieldsSchema)) {
      return (
        <Container id="e2e-signup-custom-fields-container">
          <UserCustomFieldsForm
            onSubmit={handleCustomFieldsFormOnSubmit}
            authUser={authUser}
          />

          <ButtonWrapper>
            <SubmitButton
              id="e2e-signup-custom-fields-submit-btn"
              processing={processingSubmit}
              text={formatMessage(messages.completeSignUp)}
              onClick={handleOnSubmitButtonClick}
            />
            {!userCustomFieldsSchema.hasRequiredFields && (
              <SkipButton
                id="e2e-signup-custom-fields-skip-btn"
                buttonStyle="text"
                padding="0"
                textDecoration="underline"
                textDecorationHover="underline"
                processing={processingSkip}
                onClick={skipStep}
              >
                {formatMessage(messages.skip)}
              </SkipButton>
            )}
          </ButtonWrapper>
          <Error text={unknownError} />
        </Container>
      );
    }

    return null;
  }
);

const CustomFieldsWithHoC = injectIntl(CustomFieldsStep);

export default CustomFieldsWithHoC;
