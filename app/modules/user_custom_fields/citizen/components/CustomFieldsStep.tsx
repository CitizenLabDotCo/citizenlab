import React, { FormEvent, FC, memo, useEffect, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { isObject } from 'lodash-es';

// components
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import { Spinner } from 'cl2-component-library';
import UserCustomFieldsForm from 'modules/user_custom_fields/citizen/components/UserCustomFieldsForm';

// services
import { completeRegistration } from 'services/users';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from '../../../../components/SignUpIn/SignUp/messages';

// utils
import eventEmitter from 'utils/eventEmitter';
import { colors, fontSizes, media } from 'utils/styleUtils';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';

// typings
import {
  TSignUpSteps,
  TSignUpStepConfigurationObject,
} from 'components/SignUpIn/SignUp';

import useAuthUser from 'hooks/useAuthUser';
import useUserCustomFieldsSchema from 'modules/user_custom_fields/hooks/useUserCustomFieldsSchema';

const Loading = styled.div`
  padding-top: 15px;
`;

const Container = styled.div`
  padding-bottom: 30px;

  ${media.smallerThanMinTablet`
    padding-bottom: 15px;
  `}
`;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: -15px;

  ${media.smallerThanMinTablet`
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
  `}
`;

const SkipButton = styled.button`
  color: ${colors.clGreyOnGreyBackground};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 20px;
  cursor: pointer;
  margin-left: 15px;

  &:hover {
    color: #000;
    text-decoration: underline;
  }

  ${media.smallerThanMinTablet`
    margin-left: 0px;
    margin-top: 30px;
    text-align: center;
  `}
`;

type InputProps = {
  onCompleted: () => void;
  onData: (data: {
    key: TSignUpSteps;
    configuration: TSignUpStepConfigurationObject;
  }) => void;
  step: TSignUpSteps;
};

interface Props extends InputProps, InjectedIntlProps {}

const CustomFieldsStep: FC<Props & InjectedIntlProps> = memo(
  ({ onData, intl: { formatMessage }, onCompleted, step }) => {
    const [processing, setProcessing] = useState<boolean>(false);
    const [unknownError, setUnknownError] = useState<string | null>();

    const authUser = useAuthUser();
    const userCustomFieldsSchema = useUserCustomFieldsSchema();

    useEffect(() => {
      trackEventByName(tracks.signUpCustomFieldsStepEntered);
      return () => {
        trackEventByName(tracks.signUpCustomFieldsStepExited);
      };
    }, []);

    useEffect(() => {
      if (!isNilOrError(userCustomFieldsSchema)) {
        onData({
          key: 'custom-fields',
          configuration: {
            position: 4,
            stepName: formatMessage(messages.completeYourProfile),
            helperText: (tenant) =>
              tenant?.attributes?.settings?.core
                .custom_fields_signup_helper_text,
            isEnabled: () => userCustomFieldsSchema.hasCustomFields,
            isActive: (authUser) =>
              !authUser?.attributes.registration_completed_at,
          },
        });
      }
    }, [userCustomFieldsSchema]);

    const handleOnSubmitButtonClick = (event: FormEvent) => {
      event.preventDefault();
      eventEmitter.emit('customFieldsSubmitEvent');
    };

    const handleCustomFieldsFormOnSubmit = async ({ formData }) => {
      if (!isNilOrError(authUser) && isObject(formData)) {
        try {
          setProcessing(true);
          setUnknownError(null);

          await completeRegistration(formData);

          setProcessing(false);
          trackEventByName(tracks.signUpCustomFieldsStepCompleted);
          onCompleted();
        } catch (error) {
          trackEventByName(tracks.signUpCustomFieldsStepFailed, { error });
          setProcessing(false);
          setUnknownError(formatMessage(messages.unknownError));
        }
      }
    };

    const skipStep = async (event: FormEvent) => {
      event.preventDefault();

      trackEventByName(tracks.signUpCustomFieldsStepSkipped);

      if (!isNilOrError(authUser)) {
        await completeRegistration({});
      }

      onCompleted();
    };

    if (step !== 'custom-fields') {
      return null;
    }

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
            <Button
              id="e2e-signup-custom-fields-submit-btn"
              processing={processing}
              text={formatMessage(messages.completeSignUp)}
              onClick={handleOnSubmitButtonClick}
            />
            {!userCustomFieldsSchema.hasRequiredFields && (
              <SkipButton
                className="e2e-signup-custom-fields-skip-btn"
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

const CustomFieldsWithHoC = injectIntl<Props>(CustomFieldsStep);

export default CustomFieldsWithHoC;
