import React, { useEffect } from 'react';

// typings
import { Multiloc, UploadFile } from 'typings';

// form
import { FormProvider, useForm } from 'react-hook-form';
import { SectionField } from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import Feedback from 'components/HookForm/Feedback';
import { yupResolver } from '@hookform/resolvers/yup';
import { mixed, object } from 'yup';
import validateAtLeastOneLocale from 'utils/yup/validateAtLeastOneLocale';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import ImagesDropzone from 'components/HookForm/ImagesDropzone';

// components
import Button from 'components/UI/Button';
import { Box } from '@citizenlab/cl2-component-library';

// intl
import messages from './messages';
import { useIntl } from 'utils/cl-intl';
import { convertUrlToUploadFile } from 'utils/fileUtils';

export interface FormValues {
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
  image?: UploadFile[] | null;
}

export interface SubmitValues {
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
  image?: string | null;
}

type PageFormProps = {
  onSubmit: (formValues: SubmitValues) => void | Promise<void>;
  defaultValues?: FormValues;
  imageUrl?: string | null;
};

const CauseForm = ({ onSubmit, defaultValues, imageUrl }: PageFormProps) => {
  const { formatMessage } = useIntl();
  const schema = object({
    title_multiloc: validateAtLeastOneLocale(
      formatMessage(messages.emptyTitleErrorMessage)
    ),
    description_multiloc: validateAtLeastOneLocale(
      formatMessage(messages.emptyDescriptionErrorMessage)
    ),
    image: mixed().nullable(),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  // Load the API cause object as a local image
  useEffect(() => {
    if (imageUrl) {
      (async () => {
        const newImage = await convertUrlToUploadFile(imageUrl);
        if (newImage) {
          methods.setValue('image', [newImage]);
        }
      })();
    }
  }, [imageUrl, methods]);

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      const image = formValues.image?.length
        ? formValues.image[0].base64
        : null;
      await onSubmit({ ...formValues, image });
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onFormSubmit)}
        data-testid="causeForm"
      >
        <SectionField>
          <Feedback />
          <InputMultilocWithLocaleSwitcher
            name="title_multiloc"
            label={formatMessage(messages.causeTitleLabel)}
          />
        </SectionField>
        <SectionField>
          <QuillMultilocWithLocaleSwitcher
            name="description_multiloc"
            noImages
            noVideos
            limitedTextFormatting
            label={formatMessage(messages.causeDescriptionLabel)}
            labelTooltipText={formatMessage(messages.causeDescriptionTooltip)}
            withCTAButton
          />
        </SectionField>
        <SectionField>
          <ImagesDropzone
            name="image"
            imagePreviewRatio={135 / 298}
            maxImagePreviewWidth="298px"
            acceptedFileTypes={{
              'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
            }}
            inputLabel={formatMessage(messages.causeImageLabel)}
          />
        </SectionField>
        <Box display="flex">
          <Button type="submit" processing={methods.formState.isSubmitting}>
            {formatMessage(messages.saveCause)}
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
};

export default CauseForm;
