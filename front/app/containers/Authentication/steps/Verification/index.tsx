import React from 'react';

import {
  AuthenticationData,
  SetError,
} from 'containers/Authentication/typings';

import VerificationSteps from './VerificationSteps';

interface Props {
  setError: SetError;
  onCompleted: () => void;
  authenticationData: AuthenticationData;
}

const VerificationSignUpStep = ({
  setError,
  onCompleted,
  authenticationData,
}: Props) => {
  const handleOnCompleted = () => {
    onCompleted();
  };

  const handleOnError = () => {
    setError('unknown');
  };

  return (
    <VerificationSteps
      onCompleted={handleOnCompleted}
      onError={handleOnError}
      authenticationData={authenticationData}
    />
  );
};

export default VerificationSignUpStep;
