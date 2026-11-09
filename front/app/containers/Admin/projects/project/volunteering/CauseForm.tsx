import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { FormProvider } from 'react-hook-form';

import useContainerWidthAndHeight from 'hooks/useContainerWidthAndHeight';

import { SectionField } from 'components/admin/Section';
import Feedback from 'components/HookForm/Feedback';
import ImagesDropzone from 'components/HookForm/ImagesDropzone';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import { defaultAdminCardPadding } from 'utils/styleConstants';

import messages from './messages';
import useCauseForm, {
  CauseFormValues,
  SubmitValues,
  toSubmitValues,
} from './useCauseForm';

type PageFormProps = {
  onSubmit: (formValues: SubmitValues) => void | Promise<void>;
  defaultValues?: Partial<CauseFormValues>;
  imageUrl?: string | null;
};

const CauseForm = ({ onSubmit, defaultValues, imageUrl }: PageFormProps) => {
  const { formatMessage } = useIntl();
  const { width, containerRef } = useContainerWidthAndHeight();
  const { methods, submit } = useCauseForm({
    onSubmit: (values) => onSubmit(toSubmitValues(values)),
    defaultValues,
    imageUrl,
  });

  return (
    <Box ref={containerRef}>
      <FormProvider {...methods}>
        <form onSubmit={submit} data-testid="causeForm">
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
          <Box
            position="fixed"
            borderTop={`1px solid ${colors.divider}`}
            bottom="0"
            w={`calc(${width}px + ${defaultAdminCardPadding * 2}px)`}
            ml={`-${defaultAdminCardPadding}px`}
            background={colors.white}
            display="flex"
            justifyContent="flex-start"
          >
            <Box py="8px" px={`${defaultAdminCardPadding}px`}>
              <ButtonWithLink
                type="submit"
                processing={methods.formState.isSubmitting}
              >
                {formatMessage(messages.saveCause)}
              </ButtonWithLink>
            </Box>
          </Box>
        </form>
      </FormProvider>
    </Box>
  );
};

export default CauseForm;
