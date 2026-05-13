import { useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

import { IFlatCustomField } from 'api/custom_fields/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import generateYupValidationSchema from '../generateYupSchema';
import messages from '../messages';

import { FormValues } from './types';

const usePageForm = ({
  pageQuestions,
  defaultValues,
}: {
  pageQuestions: IFlatCustomField[];
  defaultValues?: FormValues;
}) => {
  const [showFormFeedback, setShowFormFeedback] = useState(false);
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const schema = generateYupValidationSchema({
    pageQuestions,
    formatMessage,
    localize,
  });
  const baseResolver = yupResolver(schema);

  const methods = useForm({
    mode: 'onBlur',
    // Yup can't see "bad input" in <input type="number"> (browser reports value="" while validity.badInput=true, and React's value-tracker suppresses the change event for the empty→invalid transition). Sweep the DOM after Yup runs and override the error for any number field whose input is in that state.
    resolver: (async (values, context, options) => {
      const result = await baseResolver(values, context, options);
      pageQuestions.forEach((question) => {
        if (question.input_type !== 'number') return;
        const el = document.querySelector<HTMLInputElement>(
          `input[name="${CSS.escape(question.key)}"]`
        );
        if (el?.validity.badInput) {
          (result.errors as Record<string, unknown>)[question.key] = {
            type: 'badInput',
            message: formatMessage(messages.mustBeNumber, {
              fieldName: localize(question.title_multiloc),
            }),
          };
        }
      });
      return result;
    }) as typeof baseResolver,
    defaultValues,
  });

  return {
    methods,
    showFormFeedback,
    setShowFormFeedback,
  };
};

export default usePageForm;
