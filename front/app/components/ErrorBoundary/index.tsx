// note that in devmode, errors caught by error boundary will be sent twice to sentry, this won't happen in production
// https://github.com/facebook/react/issues/10474

import React, { Component } from 'react';

import { fontSizes, colors } from '@citizenlab/cl2-component-library';
import { withScope, showReportDialog } from '@sentry/react';
import { WrappedComponentProps } from 'react-intl';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import styled from 'styled-components';

import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { reportError } from 'utils/loggingUtils';
import { getFullName } from 'utils/textUtils';

import messages from './messages';

const Container = styled.div`
  width: 100%;
  text-align: center;
  margin-top: 50px;
  font-size: ${fontSizes.l}px;
`;

const StyledButton = styled.button`
  outline: none;
  color: ${colors.teal};
  &.hover,
  &.focus {
    text-decoration: underline;
  }
`;

const ReloadButton = styled(StyledButton)`
  display: block;
  margin: 20px auto 0;
  text-decoration: underline;
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

// Weglot rewrites text nodes inside React-managed DOM, which can crash React
// renders. Recording whether it's active (and in which language) lets us tell
// those crashes apart.
const weglotLang = (): string | null => {
  try {
    return window.Weglot?.getCurrentLang() ?? null;
  } catch {
    return null;
  }
};

const isFramed = (): boolean => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

// Tags are indexed by Sentry, so these are the values worth filtering on.
const errorBoundaryTags = () => ({
  tenant_host: window.location.hostname,
  route: window.location.pathname,
  weglot_active: !!window.Weglot,
  weglot_lang: weglotLang() ?? 'none',
  in_iframe: isFramed(),
});

const errorBoundaryContext = () => ({
  url: window.location.href,
  user_agent: navigator.userAgent,
  browser_languages: navigator.languages.join(', '),
  document_lang: document.documentElement.lang,
  viewport: `${window.innerWidth}x${window.innerHeight}`,
  device_pixel_ratio: window.devicePixelRatio,
  touch_points: navigator.maxTouchPoints,
  seconds_since_page_load: Math.round(performance.now() / 1000),
});

class ErrorBoundary extends Component<Props & WrappedComponentProps, State> {
  constructor(props: Props & WrappedComponentProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Report to Sentry, with enough browser and page context to diagnose
    // crashes we can't reproduce (e.g. device- or third-party-script-specific).
    // See TAN-8719.
    withScope((scope) => {
      Object.keys(errorInfo).forEach((key) => {
        scope.setExtra(key, errorInfo[key]);
      });
      scope.setExtra('from', 'ErrorBoundary');
      scope.setTags(errorBoundaryTags());
      scope.setContext('error_boundary', errorBoundaryContext());
      reportError(error);
    });
  }

  reload = () => {
    window.location.reload();
  };

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
      const { email } = authUser.attributes;
      Object.assign(reportDialogProperties, {
        user: {
          email,
          name: getFullName(authUser),
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
          <ReloadButton onClick={this.reload}>
            <FormattedMessage {...messages.reloadPage} />
          </ReloadButton>
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
