import { useEffect, useState } from 'react';
import { useAuthUser } from 'hooks/useAuthUser';

function useSignUpInMetaData() {
  const authUser = useAuthUser();

  const [metaData, setMetaData] = useState<ISignUpInMetaData | undefined>(
    undefined
  );

  const [signUpActiveStep, setSignUpActiveStep] = useState<
    TSignUpSteps | null | undefined
  >(undefined);

  const participationConditions = useParticipationConditions(
    metaData?.verificationContext
  );

  const hasParticipationConditions =
    !isNilOrError(participationConditions) &&
    participationConditions.length > 0;

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
    ];

    return () =>
      subscriptions.forEach((subscription) => subscription.unsubscribe());
  }, [authUser]);

  const modalWidth = !!(
    signUpActiveStep === 'verification' && hasParticipationConditions
  )
    ? 820
    : 580;

  return {
    modalWith,
  };
}
