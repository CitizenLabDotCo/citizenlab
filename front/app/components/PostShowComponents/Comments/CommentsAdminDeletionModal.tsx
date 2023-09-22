// Libraries
import React from 'react';

// Services
import { DeleteReason, DeleteReasonCode } from 'api/comments/types';

// Components
import Button from 'components/UI/Button';
import { SectionField } from 'components/admin/Section';
import { Box } from '@citizenlab/cl2-component-library';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { string, object } from 'yup';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import TextArea from 'components/HookForm/TextArea';
import Feedback from 'components/HookForm/Feedback';
import RadioGroup from 'components/HookForm/RadioGroup';
import Radio from 'components/HookForm/RadioGroup/Radio';

// i18n
import { MessageDescriptor } from 'react-intl';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// animation
import CSSTransition from 'react-transition-group/CSSTransition';
import TransitionGroup from 'react-transition-group/TransitionGroup';

// Styling
import styled from 'styled-components';

// utils
import { keys } from 'utils/helperUtils';

const ButtonsWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  width: 100%;

  .Button {
    margin-right: 1rem;
    margin-bottom: 0.5rem;
  }
`;

const timeout = 300;

const DeleteReasonContainer = styled.div`
  transition: all ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);
  overflow: hidden;

  &.reason-enter {
    max-height: 0px;
    opacity: 0;

    &.reason-enter-active {
      max-height: 180px;
      opacity: 1;
    }
  }

  &.reason-exit {
    max-height: 180px;
    opacity: 1;

    &.reason-exit-active {
      max-height: 0px;
      opacity: 0;
    }
  }
`;

type ReasonCode = keyof typeof DeleteReasonCode;

type FormValues = {
  reason_code: ReasonCode;
  other_reason?: string;
};

type Props = {
  onDeleteComment: (reason: DeleteReason) => Promise<void>;
  onCloseDeleteModal: () => void;
};

const deleteReasonCodes = keys(DeleteReasonCode);

const DELETE_REASON_MESSAGES: Record<ReasonCode, MessageDescriptor> = {
  irrelevant: messages.deleteReason_irrelevant,
  inappropriate: messages.deleteReason_inappropriate,
  other: messages.deleteReason_other,
};

const CommentsAdminDeletionForm = ({
  onDeleteComment,
  onCloseDeleteModal,
}: Props) => {
  const { formatMessage } = useIntl();
  const schema = object({
    reason_code: string().required(formatMessage(messages.deleteReasonError)),
    other_reason: string().when('reason_code', {
      is: 'other',
      then: string().required(
        formatMessage(messages.deleteReasonDescriptionError)
      ),
    }),
  });

  const methods = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema),
  });

  const onFormSubmit = async (values: FormValues) => {
    try {
      await onDeleteComment(values);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  return (
    <Box p="30px">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onFormSubmit)}>
          <Feedback />

          <SectionField>
            <RadioGroup name="reason_code">
              {deleteReasonCodes.map((code) => (
                <Radio
                  value={code}
                  name="reason_code"
                  id={`reason_code-${code}`}
                  label={formatMessage(DELETE_REASON_MESSAGES[code])}
                  key={code}
                />
              ))}
            </RadioGroup>
          </SectionField>

          <TransitionGroup>
            {methods.getValues('reason_code') === 'other' ? (
              <CSSTransition
                classNames="reason"
                timeout={timeout}
                enter={true}
                exit={true}
              >
                <DeleteReasonContainer>
                  <SectionField>
                    <TextArea name="other_reason" />
                  </SectionField>
                </DeleteReasonContainer>
              </CSSTransition>
            ) : null}
          </TransitionGroup>

          <ButtonsWrapper>
            <Button buttonStyle="secondary" onClick={onCloseDeleteModal}>
              {formatMessage(messages.adminCommentDeletionCancelButton)}
            </Button>
            <Button
              type="submit"
              buttonStyle="primary"
              processing={methods.formState.isSubmitting}
            >
              {formatMessage(messages.adminCommentDeletionConfirmButton)}
            </Button>
          </ButtonsWrapper>
        </form>
      </FormProvider>
    </Box>
  );
};

export default CommentsAdminDeletionForm;
