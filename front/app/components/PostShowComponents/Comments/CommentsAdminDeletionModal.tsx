// Libraries
import React, { PureComponent } from 'react';

// Services
import { DeleteReasonCode } from 'services/comments';

// Components
import FormikTextArea from 'components/UI/FormikTextArea';
import { Formik, Form } from 'formik';
import FormikRadio from 'components/UI/FormikRadio';
import Button from 'components/UI/Button';
import { SectionField } from 'components/admin/Section';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// animation
import CSSTransition from 'react-transition-group/CSSTransition';
import TransitionGroup from 'react-transition-group/TransitionGroup';

// Styling
import styled from 'styled-components';

const Container = styled.div`
  padding: 30px;
`;

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

const DeleteReason = styled.div`
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

export interface Props {
  onDeleteComment: (values) => void;
  onCloseDeleteModal: () => void;
}

export interface State {}

class CommentsAdminDeletionForm extends PureComponent<Props, State> {
  validateForm = (values) => {
    const errors: { reason_code?: any; other_reason?: any } = {};

    if (!values.reason_code) {
      errors.reason_code = 'Required';
    }

    if (values.reason_code === 'other' && !values.other_reason) {
      errors.other_reason = 'Required';
    }

    return errors;
  };

  render() {
    return (
      <Container>
        <Formik
          initialValues={{ reason_code: null, other_reason: null }}
          onSubmit={this.props.onDeleteComment}
          validate={this.validateForm}
        >
          {({ values, isSubmitting, isValid }) => (
            <Form noValidate>
              <SectionField>
                {Object.keys(DeleteReasonCode).map((code) => (
                  <FormikRadio
                    value={code}
                    name="reason_code"
                    id={`reason_code-${code}`}
                    label={
                      <FormattedMessage {...messages[`deleteReason_${code}`]} />
                    }
                    key={code}
                  />
                ))}
              </SectionField>

              <TransitionGroup>
                {values.reason_code === 'other' ? (
                  <CSSTransition
                    classNames="reason"
                    timeout={timeout}
                    enter={true}
                    exit={true}
                  >
                    <DeleteReason>
                      <SectionField>
                        <FormikTextArea name="other_reason" />
                      </SectionField>
                    </DeleteReason>
                  </CSSTransition>
                ) : null}
              </TransitionGroup>

              <ButtonsWrapper>
                <Button
                  buttonStyle="secondary"
                  onClick={this.props.onCloseDeleteModal}
                >
                  <FormattedMessage
                    {...messages.adminCommentDeletionCancelButton}
                  />
                </Button>
                <Button
                  disabled={!isValid}
                  buttonStyle="primary"
                  processing={isSubmitting}
                >
                  <FormattedMessage
                    {...messages.adminCommentDeletionConfirmButton}
                  />
                </Button>
              </ButtonsWrapper>
            </Form>
          )}
        </Formik>
      </Container>
    );
  }
}

export default CommentsAdminDeletionForm;
