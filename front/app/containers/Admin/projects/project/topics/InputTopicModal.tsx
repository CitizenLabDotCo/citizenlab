import React, { useEffect } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { Multiloc } from 'typings';
import { object } from 'yup';

import { IInputTopicData } from 'api/input_topics/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

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

import messages from './messages';

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
  variant?: 'default' | 'bo';
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

  const isBo = variant === 'bo';
  const submit = methods.handleSubmit(onFormSubmit);

  const cancelButton = (
    <Button
      buttonStyle={isBo ? 'bo-secondary' : 'secondary-outlined'}
      width={isBo ? 'auto' : undefined}
      onClick={close}
    >
      <FormattedMessage {...messages.cancel} />
    </Button>
  );

  const saveButton = (
    <Button
      type="submit"
      buttonStyle={isBo ? 'bo-primary' : 'primary'}
      width={isBo ? 'auto' : undefined}
      processing={methods.formState.isSubmitting}
      onClick={isBo ? submit : undefined}
      id="e2e-submit-input-topic-button"
    >
      {formatMessage(messages.save)}
    </Button>
  );

  const getHeaderMessage = () => {
    if (isEditing) {
      return <FormattedMessage {...messages.editInputTopic} />;
    }
    if (isAddingSubtopic) {
      return <FormattedMessage {...messages.addSubtopic} />;
    }
    return <FormattedMessage {...messages.addInputTopic} />;
  };

  return (
    <Modal
      variant={variant}
      opened={opened}
      close={close}
      header={getHeaderMessage()}
      footer={
        isBo ? (
          <Box display="flex" justifyContent="flex-end" gap="8px" w="100%">
            {cancelButton}
            {saveButton}
          </Box>
        ) : undefined
      }
    >
      <ModalContentContainer>
        <FormProvider {...methods}>
          <form onSubmit={submit} data-testid="inputTopicForm">
            <SectionField>
              <Feedback />
              <Box display="flex" gap="16px" alignItems="flex-end">
                <InputMultilocWithLocaleSwitcher
                  name="title_multiloc"
                  label={formatMessage(messages.fieldTopicTitle)}
                  variant={variant}
                />
                {!isSubtopic && nestedTopicsEnabled && (
                  <EmojiPicker
                    name="icon"
                    label={formatMessage(messages.fieldTopicEmoji)}
                    variant={variant}
                  />
                )}
              </Box>
            </SectionField>
            <SectionField>
              <QuillMultilocWithLocaleSwitcher
                name="description_multiloc"
                label={formatMessage(messages.fieldTopicDescription)}
                variant={variant}
                noImages
                noLinks
                noVideos
                noAlign
                limitedTextFormatting
              />
            </SectionField>

            {!isBo && (
              <ButtonsWrapper>
                {cancelButton}
                {saveButton}
              </ButtonsWrapper>
            )}
          </form>
        </FormProvider>
      </ModalContentContainer>
    </Modal>
  );
};

export default InputTopicModal;
