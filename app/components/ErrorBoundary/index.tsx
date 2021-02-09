// note that in devmode, errors caught by error boundary will be sent twice to sentry, this won't happen in production
// https://github.com/facebook/react/issues/10474

import React, { Component } from 'react';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { withScope, showReportDialog } from '@sentry/browser';
import messages from './messages';
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import { isNilOrError } from 'utils/helperUtils';
import { InjectedIntlProps } from 'react-intl';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import { reportError } from 'utils/loggingUtils';

const Container = styled.div`
  width: 100%;
  text-align: center;
  margin-top: 50px;
  font-size: ${fontSizes.large}px;
`;

const StyledButton = styled.button`
  outline: none;
  color: ${colors.clBlue};
  &.hover,
  &.focus {
    text-decoration: underline;
  }
`;

interface InputProps {
  children: React.ReactNode;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps {}

type State = {
  hasError: boolean;
};

class ErrorBoundary extends Component<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Report to Sentry
    withScope((scope) => {
      Object.keys(errorInfo).forEach((key) => {
        scope.setExtra(key, errorInfo[key]);
        scope.setExtra('from', 'ErrorBoundary');
      });
      reportError(error);
    });
  }

  openDialog = () => {
    const {
      authUser,
      intl: { formatMessage },
    } = this.props;
    const title = formatMessage(messages.errorFormTitle);
    const subtitle = formatMessage(messages.errorFormSubtitle);
    const subtitle2 = formatMessage(messages.errorFormSubtitle2);
    const labelName = formatMessage(messages.errorFormLabelName);
    const labelEmail = formatMessage(messages.errorFormLabelEmail);
    const labelComments = formatMessage(messages.errorFormLabelComments);
    const labelClose = formatMessage(messages.errorFormLabelClose);
    const labelSubmit = formatMessage(messages.errorFormLabelSubmit);
    const errorGeneric = formatMessage(messages.errorFormErrorGeneric);
    const errorFormEntry = formatMessage(messages.errorFormErrorFormEntry);
    const successMessage = formatMessage(messages.errorFormSuccessMessage);
    const reportDialogProperties = {
      title,
      subtitle,
      subtitle2,
      labelName,
      labelEmail,
      labelComments,
      labelClose,
      labelSubmit,
      errorGeneric,
      errorFormEntry,
      successMessage,
    };
    if (!isNilOrError(authUser)) {
      const { first_name, last_name, email } = authUser.attributes;
      Object.assign(reportDialogProperties, {
        user: {
          email,
          name: `${first_name} ${last_name}`,
        },
      });
    }

    showReportDialog(reportDialogProperties);
  };

  render() {
    const { children } = this.props;

    if (this.state.hasError) {
      return (
        <Container>
          <FormattedMessage
            {...messages.genericErrorWithForm}
            values={{
              openForm: (
                <StyledButton onClick={this.openDialog}>
                  <FormattedMessage {...messages.openFormText} />
                </StyledButton>
              ),
            }}
          />
        </Container>
      );
    }

    return children;
  }
}

const ErrorBoundaryWithIntl = injectIntl(ErrorBoundary);

export default (inputProps: InputProps) => (
  <GetAuthUser>
    {(authUser) => {
      return <ErrorBoundaryWithIntl authUser={authUser} {...inputProps} />;
    }}
  </GetAuthUser>
);
