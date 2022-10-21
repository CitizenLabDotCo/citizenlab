import React, { PureComponent, FormEvent } from 'react';
import { omit } from 'lodash-es';
import CSSTransition from 'react-transition-group/CSSTransition';

// styles
import { colors, fontSizes } from 'utils/styleUtils';
import styled, { css } from 'styled-components';

// components
import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';
import Button, {
  ButtonStyles,
  Props as OriginalButtonProps,
} from 'components/UI/Button';

// typings
import { Omit } from 'typings';

export type ISubmitState =
  | 'disabled'
  | 'enabled'
  | 'error'
  | 'customError'
  | 'success';

const Wrapper: any = styled.div`
  display: flex;
  align-items: center;

  ${(props: any) =>
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
    'className' | 'text' | 'disabled' | 'setSubmitButtonRef' | 'processing'
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

export default class SubmitWrapper extends PureComponent<Props> {
  submitButton: HTMLButtonElement | null;
  secondaryButton: HTMLButtonElement | null;

  constructor(props: Props) {
    super(props as any);
    this.submitButton = null;
    this.secondaryButton = null;
  }

  removeFocus = (el: HTMLButtonElement | null) => {
    el && el.blur();
  };

  setSubmitButtonRef = (el: HTMLButtonElement | null) => {
    this.submitButton = el;
  };

  setSecondaryButtonRef = (el: HTMLButtonElement | null) => {
    this.secondaryButton = el;
  };

  render() {
    const style = this.props.buttonStyle || 'cl-blue';
    const secondaryButtonStyle =
      this.props.secondaryButtonStyle || 'primary-outlined';

    if (this.props.status === 'success' || this.props.status === 'error') {
      this.removeFocus(this.submitButton);
      if (this.secondaryButton) {
        this.removeFocus(this.secondaryButton);
      }
    }

    const buttonProps = omit(this.props, [
      'className',
      'style',
      'processing',
      'disabled',
      'onClick',
      'setSubmitButtonRef',
      'messages',
      'loading',
    ]);

    const { loading, status, onClick, messages, animate, customError } =
      this.props;

    // give the option to leave the form enabled even in success state
    const isSubmitButtonDisabled =
      status === 'disabled' ||
      (!this.props.enableFormOnSuccess && status === 'success');

    return (
      <Wrapper aria-live="polite" fullWidth={!!buttonProps.fullWidth}>
        <Button
          className="e2e-submit-wrapper-button"
          buttonStyle={style}
          processing={loading}
          disabled={isSubmitButtonDisabled}
          onClick={onClick}
          setSubmitButtonRef={this.setSubmitButtonRef}
          {...buttonProps}
        >
          {(status === 'enabled' ||
            status === 'disabled' ||
            status === 'error') && (
            <FormattedMessage {...messages.buttonSave} />
          )}
          {status === 'success' && (
            <FormattedMessage {...messages.buttonSuccess} />
          )}
        </Button>

        {/* show a secondary button if an onClick handler is provided for it */}
        {this.props.secondaryButtonOnClick && (
          <Button
            data-cy="e2e-submit-wrapper-secondary-submit-button"
            buttonStyle={secondaryButtonStyle}
            processing={loading}
            disabled={isSubmitButtonDisabled}
            onClick={this.props.secondaryButtonOnClick}
            setSubmitButtonRef={this.setSecondaryButtonRef}
            ml="25px"
          >
            {this.props.secondaryButtonSaveMessage ? (
              <FormattedMessage {...this.props.secondaryButtonSaveMessage} />
            ) : (
              <FormattedMessage {...messages.buttonSave} />
            )}
          </Button>
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
  }
}
