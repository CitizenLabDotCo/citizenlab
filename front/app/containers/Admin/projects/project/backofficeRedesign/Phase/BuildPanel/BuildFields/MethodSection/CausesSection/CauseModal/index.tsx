import React from 'react';

import { FormProvider } from 'react-hook-form';

import Modal from 'design-system/Modal';

import volunteeringMessages from 'containers/Admin/projects/project/volunteering/messages';
import useCauseForm, {
  CauseFormValues,
} from 'containers/Admin/projects/project/volunteering/useCauseForm';

import FormMultilocRichTextField from 'components/admin/MultilocFields/FormMultilocRichTextField';
import FormMultilocTextField from 'components/admin/MultilocFields/FormMultilocTextField';
import Feedback from 'components/HookForm/Feedback';

import { useIntl } from 'utils/cl-intl';

import causesSectionMessages from '../messages';
import { StagedCause } from '../useStagedCauses';

import CauseImageField from './CauseImageField';
import styles from './CauseModal.module.css';
import messages from './messages';

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
      isOpen
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      size={560}
      title={formatMessage(
        cause
          ? volunteeringMessages.editCauseTitle
          : causesSectionMessages.addACause
      )}
      secondaryAction={{
        label: formatMessage(causesSectionMessages.causeCancel),
        onPress: onClose,
      }}
      primaryAction={{
        label: formatMessage(
          cause
            ? messages.causeSaveChanges
            : volunteeringMessages.addCauseButton
        ),
        isPending: methods.formState.isSubmitting,
        onPress: () => submit(),
      }}
    >
      <FormProvider {...methods}>
        <form className={styles.form} onSubmit={submit}>
          <Feedback />
          <FormMultilocTextField
            name="title_multiloc"
            label={formatMessage(volunteeringMessages.causeTitleLabel)}
            placeholder={formatMessage(messages.causeTitlePlaceholder)}
          />
          <FormMultilocRichTextField
            name="description_multiloc"
            noVideos
            limitedTextFormatting
            label={formatMessage(volunteeringMessages.causeDescriptionLabel)}
            aria-label={formatMessage(
              volunteeringMessages.causeDescriptionLabel
            )}
            placeholder={formatMessage(messages.causeDescriptionPlaceholder)}
          />
          <CauseImageField />
        </form>
      </FormProvider>
    </Modal>
  );
};

export default CauseModal;
