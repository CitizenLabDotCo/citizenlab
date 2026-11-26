import React, { FormEvent } from 'react';

import { FormProvider } from 'react-hook-form';

import Modal from 'design-system/Modal';

import volunteeringMessages from 'containers/Admin/projects/project/volunteering/messages';
import useCauseForm, {
  CauseFormValues,
} from 'containers/Admin/projects/project/volunteering/useCauseForm';

import FormMultilocRichTextField from 'components/admin/MultilocFields/FormMultilocRichTextField';
import FormMultilocTextField from 'components/admin/MultilocFields/FormMultilocTextField';
import LanguageGroup from 'components/admin/MultilocFields/LanguageGroup';
import fieldMessages from 'components/admin/MultilocFields/messages';
import useLanguageGroup from 'components/admin/MultilocFields/useLanguageGroup';
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
  const [title, description] = methods.watch([
    'title_multiloc',
    'description_multiloc',
  ]);
  const group = useLanguageGroup(
    [
      {
        value: title,
        name: formatMessage(fieldMessages.title),
        required: true,
      },
      { value: description, name: formatMessage(fieldMessages.description) },
    ],
    { ownCheck: true }
  );
  const submitTranslated = (event?: FormEvent) => {
    if (!group.check()) {
      event?.preventDefault();
      return;
    }
    submit(event);
  };

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
        onPress: () => submitTranslated(),
      }}
    >
      <FormProvider {...methods}>
        <form className={styles.form} onSubmit={submitTranslated}>
          <Feedback />
          <LanguageGroup
            group={group}
            aria-label={formatMessage(causesSectionMessages.addACause)}
          >
            <div className={styles.languageFields}>
              <FormMultilocTextField
                name="title_multiloc"
                locale={group.selectedLocale}
                label={formatMessage(volunteeringMessages.causeTitleLabel)}
                placeholder={formatMessage(messages.causeTitlePlaceholder)}
              />
              <FormMultilocRichTextField
                name="description_multiloc"
                locale={group.selectedLocale}
                noVideos
                limitedTextFormatting
                label={formatMessage(
                  volunteeringMessages.causeDescriptionLabel
                )}
                aria-label={formatMessage(
                  volunteeringMessages.causeDescriptionLabel
                )}
                placeholder={formatMessage(
                  messages.causeDescriptionPlaceholder
                )}
              />
            </div>
          </LanguageGroup>
          <CauseImageField />
        </form>
      </FormProvider>
    </Modal>
  );
};

export default CauseModal;
