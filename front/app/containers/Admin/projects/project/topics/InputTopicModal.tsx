import React, { useEffect } from 'react';

import { Button } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { Multiloc } from 'typings';
import { object } from 'yup';

import { IInputTopicData } from 'api/input_topics/types';
import useAddInputTopic from 'api/input_topics/useAddInputTopic';
import useUpdateInputTopic from 'api/input_topics/useUpdateInputTopic';

import { SectionField } from 'components/admin/Section';
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

  const isEditing = topic !== null;
  const isAddingSubtopic = !isEditing && parentId !== undefined;

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
        });
      } else {
        methods.reset({
          title_multiloc: {},
          description_multiloc: {},
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
          ...formValues,
        });
      } else {
        await addInputTopic({
          projectId,
          title_multiloc: formValues.title_multiloc,
          description_multiloc: formValues.description_multiloc || {},
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
              <InputMultilocWithLocaleSwitcher
                name="title_multiloc"
                label={formatMessage(messages.fieldTopicTitle)}
              />
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
