import React, { useEffect } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { Multiloc } from 'typings';
import { object } from 'yup';

import { IInputTopicData } from 'api/input_topics/types';
import useAddInputTopic from 'api/input_topics/useAddInputTopic';
import useUpdateInputTopic from 'api/input_topics/useUpdateInputTopic';

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
import useFeatureFlag from 'hooks/useFeatureFlag';

interface FormValues {
  title_multiloc: Multiloc;
  description_multiloc?: Multiloc;
  icon?: string | null;
}

interface Props {
  projectId: string;
  topic: IInputTopicData | null;
  parentId?: string;
  opened: boolean;
  close: () => void;
}

const InputTopicModal = ({
  projectId,
  topic,
  parentId,
  opened,
  close,
}: Props) => {
  const { formatMessage } = useIntl();
  const { mutateAsync: addInputTopic } = useAddInputTopic();
  const { mutateAsync: updateInputTopic } = useUpdateInputTopic();
  const nestedTopicsEnabled = useFeatureFlag({ name: 'nested_input_topics' });

  const isEditing = topic !== null;
  const isAddingSubtopic = !isEditing && parentId !== undefined;
  const isEditingSubtopic = isEditing && (topic?.attributes.depth || 0) >= 1;
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
      if (isEditing) {
        await updateInputTopic({
          projectId,
          id: topic.id,
          title_multiloc: formValues.title_multiloc,
          description_multiloc: formValues.description_multiloc,
          // Only send icon for root topics
          ...(isSubtopic ? {} : { icon: formValues.icon }),
        });
      } else {
        await addInputTopic({
          projectId,
          title_multiloc: formValues.title_multiloc,
          description_multiloc: formValues.description_multiloc || {},
          icon: isSubtopic ? undefined : formValues.icon,
          parent_id: parentId,
        });
      }
      close();
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

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
    <Modal opened={opened} close={close} header={getHeaderMessage()}>
      <ModalContentContainer>
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onFormSubmit)}
            data-testid="inputTopicForm"
          >
            <SectionField>
              <Feedback />
              <Box display="flex" gap="16px" alignItems="flex-end">
                <InputMultilocWithLocaleSwitcher
                  name="title_multiloc"
                  label={formatMessage(messages.fieldTopicTitle)}
                />
                {!isSubtopic && nestedTopicsEnabled && (
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
