import React, { useState, useEffect } from 'react';

import { Text, Box, Button } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { Multiloc } from 'typings';
import { object } from 'yup';

import useAddIdeaOfficialFeedback from 'api/idea_official_feedback/useAddIdeaOfficialFeedback';

import Feedback from 'components/HookForm/Feedback';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import TextAreaMultilocWithLocaleSwitcher from 'components/HookForm/TextAreaMultilocWithLocaleSwitcher';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import eventEmitter from 'utils/eventEmitter';
import validateAtLeastOneLocale from 'utils/yup/validateAtLeastOneLocale';

import messages from './messages';

type Props = {
  ideaId: string;
};

type FormValues = {
  body_multiloc: Multiloc;
  author_multiloc: Multiloc;
};
export const getIdeaOfficialFeedbackModalEventName = (ideaId: string) => {
  return `openIdeaOfficialFeedbackModal-${ideaId}`;
};

const IdeaOfficialFeedbackModal = ({ ideaId }: Props) => {
  const [ideaOfficialFeedbackModalIsOpen, setIdeaOfficialFeedbackModalIsOpen] =
    useState(false);

  useEffect(() => {
    const subscription = eventEmitter
      .observeEvent(getIdeaOfficialFeedbackModalEventName(ideaId))
      .subscribe(() => {
        setIdeaOfficialFeedbackModalIsOpen(true);
      });
    return () => {
      subscription.unsubscribe();
    };
  }, [ideaId]);

  const { mutateAsync: addIdeaOfficialFeedback } = useAddIdeaOfficialFeedback();
  const { formatMessage } = useIntl();
  const schema = object({
    body_multiloc: validateAtLeastOneLocale(
      formatMessage(messages.emptyFeedbackError)
    ),
    author_multiloc: validateAtLeastOneLocale(
      formatMessage(messages.emptyAuthorError)
    ),
  });

  const methods = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema),
  });

  const onCloseModal = () => {
    methods.reset();
    setIdeaOfficialFeedbackModalIsOpen(false);
  };

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      await addIdeaOfficialFeedback({ ideaId, ...formValues });
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    } finally {
      onCloseModal();
    }
  };
  return (
    <Modal
      opened={ideaOfficialFeedbackModalIsOpen}
      close={onCloseModal}
      header={formatMessage(messages.title)}
    >
      <Box p="32px">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onFormSubmit)}>
            <Box display="flex" flexDirection="column" gap="24px">
              <Text>{formatMessage(messages.description)}</Text>
              <Feedback />
              <TextAreaMultilocWithLocaleSwitcher
                name="body_multiloc"
                label={formatMessage(messages.officialFeedback)}
                placeholder={formatMessage(
                  messages.officialFeedbackPlaceholder
                )}
                minRows={4}
              />
              <InputMultilocWithLocaleSwitcher
                name="author_multiloc"
                label={formatMessage(messages.author)}
                placeholder={formatMessage(messages.authorPlaceholder)}
              />
              <Box display="flex" justifyContent="flex-end">
                <Button
                  buttonStyle="text"
                  onClick={onCloseModal}
                  disabled={methods.formState.isSubmitting}
                >
                  {formatMessage(messages.skip)}
                </Button>
                <Button
                  type="submit"
                  processing={methods.formState.isSubmitting}
                >
                  {formatMessage(messages.postFeedback)}
                </Button>
              </Box>
            </Box>
          </form>
        </FormProvider>
      </Box>
    </Modal>
  );
};

export default IdeaOfficialFeedbackModal;
