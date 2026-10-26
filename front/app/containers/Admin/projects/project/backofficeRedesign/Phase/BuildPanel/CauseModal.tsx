import React from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';
import { FormProvider } from 'react-hook-form';

import volunteeringMessages from 'containers/Admin/projects/project/volunteering/messages';
import useCauseForm, {
  CauseFormValues,
} from 'containers/Admin/projects/project/volunteering/useCauseForm';

import Feedback from 'components/HookForm/Feedback';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

import CauseImageField from './CauseImageField';
import { StagedCause } from './useStagedCauses';

interface Props {
  cause?: StagedCause;
  onSubmit: (values: CauseFormValues) => void;
  onClose: () => void;
}

const CauseModal = ({ cause, onSubmit, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const saved = cause?.saved;

  const { methods, submit } = useCauseForm({
    onSubmit: (values) => {
      onSubmit(values);
      onClose();
    },
    defaultValues:
      cause?.changes ??
      (saved && {
        title_multiloc: saved.attributes.title_multiloc,
        description_multiloc: saved.attributes.description_multiloc,
      }),
    // A changed cause already holds its image as a file.
    imageUrl: cause?.changes ? undefined : saved?.attributes.image?.medium,
  });

  return (
    <Modal
      opened
      close={onClose}
      width={560}
      variant="bo"
      header={formatMessage(
        cause ? volunteeringMessages.editCauseTitle : messages.addACause
      )}
      footer={
        <Box display="flex" justifyContent="flex-end" gap="8px" width="100%">
          <Button buttonStyle="bo-text" onClick={onClose}>
            {formatMessage(messages.causeCancel)}
          </Button>
          <Button
            buttonStyle="bo-primary"
            processing={methods.formState.isSubmitting}
            onClick={submit}
          >
            {formatMessage(
              cause
                ? messages.causeSaveChanges
                : volunteeringMessages.addCauseButton
            )}
          </Button>
        </Box>
      }
    >
      <FormProvider {...methods}>
        <Box
          as="form"
          p="24px"
          display="flex"
          flexDirection="column"
          gap="24px"
          onSubmit={submit}
        >
          <Feedback />
          <InputMultilocWithLocaleSwitcher
            name="title_multiloc"
            variant="bo"
            label={formatMessage(volunteeringMessages.causeTitleLabel)}
            placeholder={formatMessage(messages.causeTitlePlaceholder)}
          />
          <QuillMultilocWithLocaleSwitcher
            name="description_multiloc"
            variant="bo"
            noVideos
            limitedTextFormatting
            minHeight="74px"
            label={formatMessage(volunteeringMessages.causeDescriptionLabel)}
            placeholder={formatMessage(messages.causeDescriptionPlaceholder)}
          />
          <CauseImageField />
        </Box>
      </FormProvider>
    </Modal>
  );
};

export default CauseModal;
