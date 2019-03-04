// Libraries
import React, { PureComponent, FormEvent } from 'react';
import styled, { css } from 'styled-components';
import CSSTransition from 'react-transition-group/CSSTransition';

// styles
import { colors } from 'utils/styleUtils';

// Components
import { FormattedMessage } from 'utils/cl-intl';
import Button, { ButtonStyles, Props as OriginalButtonProps } from 'components/UI/Button';
import { Omit } from 'typings';
import { omit } from 'lodash-es';

const Wrapper: any = styled.div`
  display: flex;
  align-items: center;
  ${(props: any) => props.fullWidth ? css`
    width: 100%;
    flex: 1;
  ` : ''}
`;

const Message = styled.p`
  margin-left: 2rem;

  &.error {
    color: ${colors.clRedError};
  }

  &.success {
    color: ${colors.clGreenSuccess};
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

// Typing
interface Props extends Omit<OriginalButtonProps, 'className' | 'text' | 'disabled' | 'setSubmitButtonRef' | 'processing'> {
  status: 'disabled' | 'enabled' | 'error' | 'success';
  loading: boolean;
  messages: {
    buttonSave: any,
    buttonSuccess: any,
    messageSuccess: any,
    messageError: any,
  };
  onClick?: (event: FormEvent<any>) => void;
  style?: ButtonStyles;
  animate?: boolean;
}

export default class SubmitWrapper extends PureComponent<Props> {
  submitButton: HTMLInputElement | null;

  constructor(props: Props)  {
    super(props as any);
    this.submitButton = null;
  }

  removeFocus = (el) => {
    el && el.blur();
  }

  setSubmitButtonRef = (el) => {
    this.submitButton = el;
  }

  render () {
    let style = this.props.style || 'cl-blue';

    if (this.props.status === 'success') {
      style = 'success';
      this.removeFocus(this.submitButton);
    }

    if (this.props.status === 'error') {
      this.removeFocus(this.submitButton);
    }
    const buttonProps = omit(this.props, ['className', 'style', 'processing', 'disabled', 'onClick', 'setSubmitButtonRef', 'messages']);
    const { loading, status, onClick, messages, animate } = this.props;

    return (
      <Wrapper fullWidth={!!buttonProps.fullWidth}>
        <Button
          className="e2e-submit-wrapper-button"
          style={style}
          processing={loading}
          disabled={status === 'disabled' || status === 'success'}
          onClick={onClick}
          setSubmitButtonRef={this.setSubmitButtonRef}
          {...buttonProps}
        >
          {(status === 'enabled' ||
            status === 'disabled' ||
            status === 'error') &&
            <FormattedMessage {...messages.buttonSave} />
          }
          {status === 'success' &&
            <FormattedMessage {...messages.buttonSuccess} />
          }
        </Button>

        {status === 'error' &&
          <Message className="error">
            <FormattedMessage {...messages.messageError}/>
          </Message>
        }

        {status === 'success' &&
          <CSSTransition
            classNames="success"
            timeout={0}
            enter={animate}
            exit={animate}
          >
            <Message className="success">
              <FormattedMessage {...messages.messageSuccess}/>
            </Message>
          </CSSTransition>
        }
      </Wrapper>
    );
  }
}
