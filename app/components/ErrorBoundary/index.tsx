import React from 'react';
import { FormattedMessage } from 'utils/cl-intl';
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

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true });

    // Report to Sentry
    if (window['Raven']) {
      window['Raven'].captureException(error, { extra: info });
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
