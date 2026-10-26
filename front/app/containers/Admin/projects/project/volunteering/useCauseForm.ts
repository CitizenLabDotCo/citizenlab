import { useEffect } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { Multiloc, UploadFile } from 'typings';
import { ObjectSchema, array, mixed, object } from 'yup';

import { useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { convertUrlToUploadFile } from 'utils/fileUtils';
import validateAtLeastOneLocale from 'utils/yup/validateAtLeastOneLocale';

import messages from './messages';

export interface CauseFormValues {
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
  image?: UploadFile[];
}

export interface SubmitValues {
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
  image: string | null;
}

export const toSubmitValues = ({
  image,
  ...values
}: CauseFormValues): SubmitValues => ({
  ...values,
  image: image?.length ? image[0].base64 : null,
});

interface Params {
  onSubmit: (values: CauseFormValues) => void | Promise<void>;
  defaultValues?: Partial<CauseFormValues>;
  imageUrl?: string | null;
}

/** The cause form's fields, validation and submission, without its layout. */
const useCauseForm = ({ onSubmit, defaultValues, imageUrl }: Params) => {
  const { formatMessage } = useIntl();

  const schema: ObjectSchema<CauseFormValues> = object({
    title_multiloc: validateAtLeastOneLocale(
      formatMessage(messages.emptyTitleErrorMessage)
    ),
    description_multiloc: validateAtLeastOneLocale(
      formatMessage(messages.emptyDescriptionErrorMessage)
    ),
    image: array(mixed<UploadFile>().required()),
  });

  const methods = useForm<CauseFormValues>({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  // The dropzone takes files, so the saved image is loaded as one.
  useEffect(() => {
    if (!imageUrl) return;
    convertUrlToUploadFile(imageUrl).then((image) => {
      if (image) methods.setValue('image', [image]);
    });
  }, [imageUrl, methods]);

  const submit = methods.handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  });

  return { methods, submit };
};

export default useCauseForm;
