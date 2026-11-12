import React from 'react';

import { FormProvider, useForm } from 'react-hook-form';

interface Props {
  answers: Record<string, unknown>;
  children: React.ReactNode;
}

// Lets the form fields display the answers read-only.
const AnswersForm = ({ answers, children }: Props) => {
  const methods = useForm({ defaultValues: answers });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

export default AnswersForm;
