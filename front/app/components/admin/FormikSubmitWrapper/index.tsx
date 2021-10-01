import React from 'react';
import { omit, isEmpty } from 'lodash-es';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import messages from './messages';
import {
  ButtonStyles,
  Props as OriginalButtonProps,
} from 'components/UI/Button';
import { Omit } from 'typings';

interface Props
  extends Omit<
    OriginalButtonProps,
    'className' | 'text' | 'disabled' | 'setSubmitButtonRef' | 'processing'
  > {
  isValid: boolean;
  isSubmitting: boolean;
  status: any;
  touched: any;
  messages?: {
    buttonSave: { id: string; defaultMessage?: string };
    buttonError: { id: string; defaultMessage?: string };
    buttonSuccess: { id: string; defaultMessage?: string };
    messageSuccess: { id: string; defaultMessage?: string };
    messageError: { id: string; defaultMessage?: string };
  };
  buttonStyle?: ButtonStyles;
  animate?: boolean;
}

interface State {}

class FormikSubmitWrapper extends React.PureComponent<Props, State> {
  getStatus = () => {
    const { isValid, status, touched } = this.props;

    if (isEmpty(touched) || !isValid) {
      return 'disabled';
    } else if (status === 'error') {
      return 'error';
    } else if (status === 'success') {
      return 'success';
    } else {
      return 'enabled';
    }
  };

  render() {
    const { isSubmitting, buttonStyle: style, animate } = this.props;
    const buttonProps = omit(this.props, [
      'status',
      'isSubmitting',
      'isValid',
      'messages',
      'style',
      'status',
      'touched',
    ]);
    const status = this.getStatus();

    return (
      <SubmitWrapper
        status={status}
        loading={isSubmitting}
        messages={this.props.messages || messages}
        buttonStyle={style || 'primary'}
        animate={animate}
        {...buttonProps}
      />
    );
  }
}

export default FormikSubmitWrapper;
