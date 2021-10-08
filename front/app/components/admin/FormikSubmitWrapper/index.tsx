import React from 'react';
import { isEmpty } from 'lodash-es';
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

const FormikSubmitWrapper = ({
  status,
  touched,
  isSubmitting,
  messages: propsMessages,
  buttonStyle,
  animate,
  ...props
}: Props) => {
  const getStatus = () => {
    if (status === 'enabled' && !isEmpty(touched)) {
      return 'enabled';
    } else if (status === 'error') {
      return 'error';
    } else if (status === 'success') {
      return 'success';
    } else {
      return 'disabled';
    }
  };

  return (
    <SubmitWrapper
      status={getStatus()}
      loading={isSubmitting}
      messages={propsMessages || messages}
      buttonStyle={buttonStyle || 'primary'}
      animate={animate}
      {...props}
    />
  );
};

export default FormikSubmitWrapper;
