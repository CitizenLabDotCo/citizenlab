import React, { FormEvent, useRef, useEffect } from 'react';

import { colors, fontSizes } from '@citizenlab/cl2-component-library';
import { omit } from 'lodash-es';
import CSSTransition from 'react-transition-group/CSSTransition';
import styled, { css } from 'styled-components';
import { Omit } from 'typings';

import ButtonWithLink, {
  ButtonStyles,
  Props as OriginalButtonProps,
} from 'components/UI/ButtonWithLink';

import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';

export type ISubmitState =
  | 'disabled'
  | 'enabled'
  | 'error'
  | 'customError'
  | 'success';

const Wrapper = styled.div<{ fullWidth: boolean }>`
  display: flex;
  align-items: center;

  ${(props) =>
    props.fullWidth
      ? css`
          width: 100%;
          flex: 1;
        `
      : ''}
`;

const Message = styled.p`
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: normal;
  margin-left: 20px;

  &.error {
    color: ${colors.red600};
  }

  &.success {
    color: ${colors.success};
  }

  &.success-enter {
    max-width: 0;
    opacity: 0;

    &.success-enter-active {
      max-width: 100%;
      opacity: 1;
      transition: max-height 400ms cubic-bezier(0.165, 0.84, 0.44, 1),
        opacity 400ms cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }

  &.success-exit {
    max-width: 100%;
    opacity: 1;

    &.success-exit-active {
      max-height: 0;
      opacity: 0;
      transition: max-height 350ms cubic-bezier(0.19, 1, 0.22, 1),
        opacity 350ms cubic-bezier(0.19, 1, 0.22, 1);
    }
  }
`;

interface Props
  extends Omit<
    OriginalButtonProps,
    'className' | 'text' | 'disabled' | 'processing'
  > {
  status: ISubmitState;
  loading: boolean;
  customError?: string | null;
  messages: {
    buttonSave: MessageDescriptor;
    buttonSuccess: MessageDescriptor;
    messageSuccess: MessageDescriptor;
    messageError: MessageDescriptor;
  };
  onClick?: (event: FormEvent<any>) => void;
  buttonStyle?: ButtonStyles;
  secondaryButtonOnClick?: (event: FormEvent<any>) => void;
  secondaryButtonStyle?: ButtonStyles;
  secondaryButtonSaveMessage?: MessageDescriptor;
  animate?: boolean;
  enableFormOnSuccess?: boolean;
}

const SubmitWrapper = (props: Props) => {
  const submitButtonRef = useRef<HTMLButtonElement>();
  const secondaryButtonRef = useRef<HTMLButtonElement>();

  const buttonProps = omit(props, [
    'className',
    'style',
    'processing',
    'disabled',
    'onClick',
    'setSubmitButtonRef',
    'messages',
    'loading',
  ]);

  const {
    loading,
    status,
    messages,
    animate,
    customError,
    fullWidth,
    secondaryButtonSaveMessage,
    secondaryButtonOnClick,
    onClick,
  } = props;

  useEffect(() => {
    if (status === 'success' || status === 'error') {
      submitButtonRef.current?.blur();
      secondaryButtonRef.current?.blur();
    }
  }, [status]);

  const setSubmitButtonRef = (el: HTMLButtonElement) => {
    submitButtonRef.current = el;
  };

  const setSecondaryButtonRef = (el: HTMLButtonElement) => {
    secondaryButtonRef.current = el;
  };

  const style = props.buttonStyle || 'admin-dark';
  const secondaryButtonStyle = props.secondaryButtonStyle || 'primary-outlined';

  const isSubmitButtonDisabled =
    status === 'disabled' ||
    (!props.enableFormOnSuccess && status === 'success');

  return (
    <Wrapper aria-live="polite" fullWidth={!!fullWidth}>
      <ButtonWithLink
        className="e2e-submit-wrapper-button"
        buttonStyle={style}
        processing={loading}
        disabled={isSubmitButtonDisabled}
        onClick={onClick}
        ref={setSubmitButtonRef}
        {...buttonProps}
      >
        {(status === 'enabled' ||
          status === 'disabled' ||
          status === 'error') && <FormattedMessage {...messages.buttonSave} />}
        {status === 'success' && (
          <FormattedMessage {...messages.buttonSuccess} />
        )}
      </ButtonWithLink>

      {/* show a secondary button if an onClick handler is provided for it */}
      {secondaryButtonOnClick && (
        <ButtonWithLink
          data-cy="e2e-submit-wrapper-secondary-submit-button"
          buttonStyle={secondaryButtonStyle}
          processing={loading}
          disabled={isSubmitButtonDisabled}
          onClick={secondaryButtonOnClick}
          ref={setSecondaryButtonRef}
          ml="25px"
        >
          {secondaryButtonSaveMessage ? (
            <FormattedMessage {...secondaryButtonSaveMessage} />
          ) : (
            <FormattedMessage {...messages.buttonSave} />
          )}
        </ButtonWithLink>
      )}

      {status === 'error' && (
        <Message className="error">
          {customError ? (
            customError
          ) : (
            <FormattedMessage {...messages.messageError} />
          )}
        </Message>
      )}

      {status === 'success' && (
        <CSSTransition
          classNames="success"
          timeout={0}
          enter={animate}
          exit={animate}
        >
          <Message className="success">
            <FormattedMessage {...messages.messageSuccess} />
          </Message>
        </CSSTransition>
      )}
    </Wrapper>
  );
};

export default SubmitWrapper;
