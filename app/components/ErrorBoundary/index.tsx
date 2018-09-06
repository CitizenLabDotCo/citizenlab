import React from 'react';
import { FormattedMessage } from 'utils/cl-intl';
import { captureException } from '@sentry/browser';
import messages from './messages';

type Props = {};
type State = {
  hasError: boolean,
};

export default class ErrorBoundary extends React.Component<Props, State>  {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error) {
    // Display fallback UI
    this.setState({ hasError: true });

    // Report to Sentry
    if (process.env.NODE_ENV !== 'development') {
      captureException(error);
    }
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <FormattedMessage {...messages.genericError} />;
    }
    return this.props.children;
  }
}
