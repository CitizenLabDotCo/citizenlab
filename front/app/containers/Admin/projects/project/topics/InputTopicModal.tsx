import React, { useEffect } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { Multiloc } from 'typings';
import { object } from 'yup';

import { Box, Button } from '@citizenlab/cl2-component-library';

import DSModal from 'design-system/Modal';

import { IInputTopicData } from 'api/input_topics/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import FormMultilocRichTextField from 'components/admin/MultilocFields/FormMultilocRichTextField';
import FormMultilocTextField from 'components/admin/MultilocFields/FormMultilocTextField';
import { SectionField } from 'components/admin/Section';
import EmojiPicker from 'components/HookForm/EmojiPicker';
import Feedback from 'components/HookForm/Feedback';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import Modal, {
  ModalContentContainer,
  ButtonsWrapper,
} from 'components/UI/Modal';

import { useIntl, FormattedMessage } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import validateMultilocForEveryLocale from 'utils/yup/validateMultilocForEveryLocale';

import styles from './InputTopicModal.module.css';
import messages from './messages';
import TopicEmojiField from './TopicEmojiField';
import 'design-system/tokens.css';

interface FormValues {
  title_multiloc: Multiloc;
  description_multiloc?: Multiloc;
  icon?: string | null;
}

export interface InputTopicFormValues {
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
  icon?: string | null;
}

interface Props {
  topic: IInputTopicData | null;
  parentId?: string;
  opened: boolean;
  close: () => void;
  onSubmit: (values: InputTopicFormValues) => Promise<void> | void;
  variant?: 'default' | 'panel';
}

const InputTopicModal = ({
  topic,
  parentId,
  opened,
  close,
  onSubmit,
  variant = 'default',
}: Props) => {
  const { formatMessage } = useIntl();
  const nestedTopicsEnabled = useFeatureFlag({ name: 'nested_input_topics' });

  const isEditing = topic !== null;
  const isAddingSubtopic = !isEditing && parentId !== undefined;
  const isEditingSubtopic = isEditing && (topic.attributes.depth || 0) >= 1;
  const isSubtopic = isAddingSubtopic || isEditingSubtopic;

  const schema = object({
    title_multiloc: validateMultilocForEveryLocale(
      formatMessage(messages.fieldTopicTitleError)
    ),
  });

  const methods = useForm<FormValues>({
    mode: 'onBlur',
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (opened) {
      if (topic) {
        methods.reset({
          title_multiloc: topic.attributes.title_multiloc,
          description_multiloc: topic.attributes.description_multiloc,
          icon: topic.attributes.icon,
        });
      } else {
        methods.reset({
          title_multiloc: {},
          description_multiloc: {},
          icon: null,
        });
      }
    }
  }, [opened, topic, methods]);

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      await onSubmit({
        title_multiloc: formValues.title_multiloc,
        description_multiloc: formValues.description_multiloc || {},
        // Only root topics have an icon
        ...(isSubtopic ? {} : { icon: formValues.icon }),
      });
      close();
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  const isPanel = variant === 'panel';
  const submit = methods.handleSubmit(onFormSubmit);

  const getHeaderMessage = () => {
    if (isEditing) {
      return <FormattedMessage {...messages.editInputTopic} />;
    }
    if (isAddingSubtopic) {
      return <FormattedMessage {...messages.addSubtopic} />;
    }
    return <FormattedMessage {...messages.addInputTopic} />;
  };

  const showEmojiField = !isSubtopic && nestedTopicsEnabled;

  if (isPanel) {
    return (
      <DSModal
        isOpen={opened}
        onOpenChange={(isOpen) => {
          if (!isOpen) close();
        }}
        title={getHeaderMessage()}
        size={560}
        primaryAction={{
          label: formatMessage(messages.save),
          onPress: () => submit(),
          isPending: methods.formState.isSubmitting,
          id: 'e2e-submit-input-topic-button',
        }}
        secondaryAction={{
          label: <FormattedMessage {...messages.cancel} />,
          onPress: close,
        }}
      >
        <FormProvider {...methods}>
          <form
            onSubmit={submit}
            data-testid="inputTopicForm"
            className={styles.form}
          >
            <Feedback />
            <div className={styles.titleRow}>
              <FormMultilocTextField
                name="title_multiloc"
                label={formatMessage(messages.fieldTopicTitle)}
              />
              {showEmojiField && (
                <TopicEmojiField
                  label={formatMessage(messages.fieldTopicEmoji)}
                />
              )}
            </div>
            <FormMultilocRichTextField
              name="description_multiloc"
              label={formatMessage(messages.fieldTopicDescription)}
              aria-label={formatMessage(messages.fieldTopicDescription)}
              noImages
              noLinks
              noVideos
              noAlign
              limitedTextFormatting
            />
          </form>
        </FormProvider>
      </DSModal>
    );
  }

  return (
    <Modal opened={opened} close={close} header={getHeaderMessage()}>
      <ModalContentContainer>
        <FormProvider {...methods}>
          <form onSubmit={submit} data-testid="inputTopicForm">
            <SectionField>
              <Feedback />
              <Box display="flex" gap="16px" alignItems="flex-end">
                <InputMultilocWithLocaleSwitcher
                  name="title_multiloc"
                  label={formatMessage(messages.fieldTopicTitle)}
                />
                {showEmojiField && (
                  <EmojiPicker
                    name="icon"
                    label={formatMessage(messages.fieldTopicEmoji)}
                  />
                )}
              </Box>
            </SectionField>
            <SectionField>
              <QuillMultilocWithLocaleSwitcher
                name="description_multiloc"
                label={formatMessage(messages.fieldTopicDescription)}
                noImages
                noLinks
                noVideos
                noAlign
                limitedTextFormatting
              />
            </SectionField>

            <ButtonsWrapper>
              <Button buttonStyle="secondary-outlined" onClick={close}>
                <FormattedMessage {...messages.cancel} />
              </Button>
              <Button
                type="submit"
                buttonStyle="primary"
                processing={methods.formState.isSubmitting}
                id="e2e-submit-input-topic-button"
              >
                {formatMessage(messages.save)}
              </Button>
            </ButtonsWrapper>
          </form>
        </FormProvider>
      </ModalContentContainer>
    </Modal>
  );
};

export default InputTopicModal;
