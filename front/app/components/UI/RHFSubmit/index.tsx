import React, { useEffect } from 'react';

import SubmitWrapper from 'components/admin/SubmitWrapper';
import { useFormContext } from 'react-hook-form';

const RHFSubmit = () => {
  const {
    watch,
    reset,
    formState: { isSubmitting, isDirty, isSubmitSuccessful, isSubmitted },
  } = useFormContext();

  useEffect(() => {
    const subscription = watch((value, { type }) => {
      if (isSubmitted && type === 'change') {
        reset(value, { keepDirty: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, reset, isSubmitted]);

  const getStatus = () => {
    if (isSubmitted && !isSubmitSuccessful) {
      return 'error';
    } else if (isSubmitted && isSubmitSuccessful) {
      return 'success';
    } else if (!isDirty) {
      return 'disabled';
    } else {
      return 'enabled';
    }
  };
  return <SubmitWrapper status={getStatus()} loading={isSubmitting} />;
};

export default RHFSubmit;
