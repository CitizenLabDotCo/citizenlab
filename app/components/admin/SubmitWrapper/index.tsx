// Libraries
import * as React from 'react';
import styled from 'styled-components';

// Components
import { FormattedMessage } from 'utils/cl-intl';
import Button, { ButtonStyles } from 'components/UI/Button';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

const Message = styled.p`
  margin-left: 2rem;

  &.error {
    color: #FC3C2D;
  }

  &.success {
    color: #32B67A;
  }
`;

// Typing
interface Props {
  status: 'disabled' | 'enabled' | 'error' | 'success';
  loading: boolean;
  messages: {
    buttonSave: any,
    buttonSuccess: any,
    messageSuccess: any,
    messageError: any,
  };
  onClick?: {(event): void};
  style?: ButtonStyles;
}

export default class SubmitWrapper extends React.Component<Props> {
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
    }

    if (this.props.status === 'error') {
      this.removeFocus(this.submitButton);
    }

    return (
      <Wrapper>
        <Button
          className="e2e-submit-wrapper-button"
          style={style}
          processing={this.props.loading}
          disabled={this.props.status === 'disabled'}
          onClick={this.props.onClick}
          setSubmitButtonRef={this.setSubmitButtonRef}
        >
          {(this.props.status === 'enabled' ||
            this.props.status === 'disabled' ||
            this.props.status === 'error') &&
            <FormattedMessage {...this.props.messages.buttonSave} />
          }
          {this.props.status === 'success' &&
            <FormattedMessage {...this.props.messages.buttonSuccess} />
          }
        </Button>

        {this.props.status === 'error' &&
          <Message className="error">
            <FormattedMessage {...this.props.messages.messageError}/>
          </Message>
        }

        {this.props.status === 'success' &&
          <Message className="success">
            <FormattedMessage {...this.props.messages.messageSuccess}/>
          </Message>
        }
      </Wrapper>
    );
  }
}
