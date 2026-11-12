import { useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

import { IFlatCustomField } from 'api/custom_fields/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import generateYupValidationSchema from '../generateYupSchema';

import { FormValues } from './types';

const usePageForm = ({
  pageQuestions,
  defaultValues,
  otherTextOptional,
}: {
  pageQuestions: IFlatCustomField[];
  defaultValues?: FormValues;
  otherTextOptional?: boolean;
}) => {
  const [showFormFeedback, setShowFormFeedback] = useState(false);
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const schema = generateYupValidationSchema({
    pageQuestions,
    formatMessage,
    localize,
    otherTextOptional,
  });

  const methods = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema),
    defaultValues,
    shouldFocusError: true,
  });

  return {
    methods,
    showFormFeedback,
    setShowFormFeedback,
  };
};

export default usePageForm;
