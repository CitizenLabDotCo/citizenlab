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
import Modal, { MEDIUM_MODAL_WIDTH } from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import eventEmitter from 'utils/eventEmitter';
import validateAtLeastOneLocale from 'utils/yup/validateAtLeastOneLocale';

import messages from './messages';

type Props = {
  ideaId: string;
  variant?: 'default' | 'bo';
};

type FormValues = {
  body_multiloc: Multiloc;
  author_multiloc: Multiloc;
};
export const getIdeaOfficialFeedbackModalEventName = (ideaId: string) => {
  return `openIdeaOfficialFeedbackModal-${ideaId}`;
};

const IdeaOfficialFeedbackModal = ({ ideaId, variant = 'default' }: Props) => {
  const isBo = variant === 'bo';
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
  const submit = methods.handleSubmit(onFormSubmit);
  // Links the submit button to the form, also from the modal footer.
  const formId = `official-feedback-form-${ideaId}`;

  const actions = (
    <Box
      display="flex"
      justifyContent="flex-end"
      gap={isBo ? '8px' : undefined}
      width="100%"
    >
      <Button
        buttonStyle={isBo ? 'bo-text' : 'text'}
        onClick={onCloseModal}
        disabled={methods.formState.isSubmitting}
      >
        {formatMessage(messages.skip)}
      </Button>
      <Button
        buttonStyle={isBo ? 'bo-primary' : 'primary'}
        type="submit"
        form={formId}
        processing={methods.formState.isSubmitting}
      >
        {formatMessage(messages.postFeedback)}
      </Button>
    </Box>
  );

  return (
    <Modal
      opened={ideaOfficialFeedbackModalIsOpen}
      close={onCloseModal}
      header={formatMessage(messages.title)}
      variant={variant}
      width={isBo ? MEDIUM_MODAL_WIDTH : undefined}
      footer={isBo ? actions : undefined}
    >
      <Box p={isBo ? '24px' : '32px'}>
        <FormProvider {...methods}>
          <form id={formId} onSubmit={submit}>
            <Box display="flex" flexDirection="column" gap="24px">
              <Text variant={isBo ? 'boHelper' : undefined}>
                {formatMessage(messages.description)}
              </Text>
              <Feedback />
              <TextAreaMultilocWithLocaleSwitcher
                name="body_multiloc"
                label={formatMessage(messages.officialFeedback)}
                placeholder={formatMessage(
                  messages.officialFeedbackPlaceholder
                )}
                minRows={4}
                variant={variant}
              />
              <InputMultilocWithLocaleSwitcher
                name="author_multiloc"
                label={formatMessage(messages.author)}
                placeholder={formatMessage(messages.authorPlaceholder)}
                variant={variant}
              />
              {!isBo && actions}
            </Box>
          </form>
        </FormProvider>
      </Box>
    </Modal>
  );
};

export default IdeaOfficialFeedbackModal;
