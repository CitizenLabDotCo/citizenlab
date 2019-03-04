import React, { Component } from 'react';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import * as Sentry from '@sentry/browser';
import messages from './messages';
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';
import { isNilOrError } from 'utils/helperUtils';
import { InjectedIntlProps } from 'react-intl';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

const Container = styled.div`
  width: 100%;
  text-align: center;
  margin-top: 50px;
  font-size: ${fontSizes.large}px;
`;

interface DataProps {
  authUser: GetAuthUserChildProps;
}

interface Props extends DataProps {}

type State = {
  hasError: boolean,
};

class ErrorBoundary extends Component<Props & InjectedIntlProps, State>  {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, errorInfo) {
    // Display fallback UI
    this.setState({ hasError: true });

    // Report to Sentry
    Sentry.withScope(scope => {
    Object.keys(errorInfo).forEach(key => {
      scope.setExtra(key, errorInfo[key]);
    });
    Sentry.captureException(error);
  });
  }

  openDialog = () => {
    const { authUser, intl: { formatMessage } } = this.props;
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
      Object.assign(reportDialogProperties, { user: {
        email,
        name: `${first_name} ${last_name}`
      }});
    }
    Sentry.showReportDialog(reportDialogProperties);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container>
          <FormattedMessage
            {...messages.genericErrorWithForm}
            values={{
              openForm: (<a onClick={this.openDialog}><FormattedMessage {...messages.openFormText} /></a>)
            }}
          />
        </Container>
      );
    }
    return this.props.children;
  }
}

const ErrorBoundaryWithIntl = injectIntl(ErrorBoundary);

export default (props) => (
  <GetAuthUser>
    {authUser => <ErrorBoundaryWithIntl authUser={authUser} {...props} />}
  </GetAuthUser>
);
