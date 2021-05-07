import React, { memo, useState, useCallback, useEffect } from 'react';
import { isFunction } from 'lodash-es';

// components
import Modal from 'components/UI/Modal';
import SignUpIn, { ISignUpInMetaData } from 'components/SignUpIn';
import { TSignUpSteps } from 'components/SignUpIn/SignUp';

// services
import { completeRegistration } from 'services/users';

// hooks
import useIsMounted from 'hooks/useIsMounted';
import useAuthUser from 'hooks/useAuthUser';
import useParticipationConditions from 'hooks/useParticipationConditions';

// utils
import { isNilOrError } from 'utils/helperUtils';

// events
import {
  openSignUpInModal$,
  closeSignUpInModal$,
  signUpActiveStepChange$,
  changeMetaData$,
  closeSignUpInModal,
} from 'components/SignUpIn/events';

// style
import styled from 'styled-components';

import useUserCustomFieldsSchema from 'modules/commercial/user_custom_fields/hooks/useUserCustomFieldsSchema';
import Outlet from 'components/Outlet';

const Container = styled.div``;

interface Props {
  className?: string;
  onMounted?: (id?: string) => void;
}

const UserCustomFieldsSignUpInModal = memo<Props>(
  ({ className, onMounted }) => {
    const isMounted = useIsMounted();
    const [metaData, setMetaData] = useState<ISignUpInMetaData | undefined>(
      undefined
    );
    const [signUpActiveStep, setSignUpActiveStep] = useState<
      TSignUpSteps | null | undefined
    >(undefined);

    const authUser = useAuthUser();
    const participationConditions = useParticipationConditions(
      metaData?.verificationContext
    );
    const customFieldsSchema = useUserCustomFieldsSchema();
    const opened = !!metaData?.inModal;

    const hasParticipationConditions =
      !isNilOrError(participationConditions) &&
      participationConditions.length > 0;
    const modalWidth = !!(
      signUpActiveStep === 'verification' && hasParticipationConditions
    )
      ? 820
      : 580;
    const modalNoClose = !!(
      metaData?.error !== true &&
      (signUpActiveStep === 'verification' ||
        signUpActiveStep === 'custom-fields') &&
      !isNilOrError(customFieldsSchema) &&
      customFieldsSchema?.hasRequiredFields
    );

    useEffect(() => {
      if (isMounted()) {
        onMounted?.();
      }
    }, [onMounted]);

    useEffect(() => {
      const subscriptions = [
        openSignUpInModal$.subscribe(({ eventValue: metaData }) => {
          // don't overwrite metaData if already present!
          !authUser &&
            setMetaData((prevMetaData) =>
              prevMetaData ? prevMetaData : metaData
            );
        }),
        closeSignUpInModal$.subscribe(() => {
          setMetaData(undefined);
        }),
        signUpActiveStepChange$.subscribe(({ eventValue: activeStep }) => {
          setSignUpActiveStep(activeStep);
        }),
        changeMetaData$.subscribe(({ eventValue: metaData }) => {
          setMetaData(metaData);
        }),
      ];

      return () =>
        subscriptions.forEach((subscription) => subscription.unsubscribe());
    }, [authUser]);

    const onClose = useCallback(() => {
      // If the user presses the close button (x) in the modal top right corner when the custom-fields step is shown and
      // when this step -does not- have required fields, then this action is the equivalent of pressing the 'skip this step' button
      // and therefore should trigger completeRegistration() in order for the user to have a valid account.
      // If completeRegistration() is not executed, the user will be logged in but will not have a valid account and therefore
      // will not be able to perform any actions (e.g. voting, posting, commenting, ...)!
      if (
        signUpActiveStep === 'custom-fields' &&
        !isNilOrError(authUser) &&
        !isNilOrError(customFieldsSchema) &&
        !customFieldsSchema?.hasRequiredFields
      ) {
        completeRegistration({});
      }

      closeSignUpInModal();
    }, [signUpActiveStep, customFieldsSchema, authUser]);

    const onSignUpInCompleted = useCallback(() => {
      const hasAction = isFunction(metaData?.action);
      const requiresVerification = !!metaData?.verification;
      const authUserIsVerified =
        !isNilOrError(authUser) && authUser.attributes.verified;

      if (hasAction && (!requiresVerification || authUserIsVerified)) {
        metaData?.action?.();
      }

      closeSignUpInModal();
    }, [metaData, authUser]);

    return (
      <Modal
        width={modalWidth}
        padding="0px"
        opened={opened}
        close={onClose}
        closeOnClickOutside={false}
        noClose={modalNoClose}
      >
        <Container id="e2e-sign-up-in-modal" className={className}>
          {metaData && (
            <SignUpIn
              metaData={metaData}
              onSignUpInCompleted={onSignUpInCompleted}
            />
          )}
          <Outlet id="app.components.SignUpIn.metaData" metaData={metaData} />
        </Container>
      </Modal>
    );
  }
);

export default UserCustomFieldsSignUpInModal;
