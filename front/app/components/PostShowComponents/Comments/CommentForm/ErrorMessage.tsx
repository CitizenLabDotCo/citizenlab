import React from 'react';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from '../messages';

interface Props {
  profanityApiError: boolean;
}

const ErrorMessage = ({ profanityApiError }: Props) => {
  const { formatMessage } = useIntl();

  // Profanity error is the only error we're checking specifically
  // at the moment to provide a specific error message.
  // All other api errors are generalized to 1 error message
  if (profanityApiError) {
    return (
      <FormattedMessage
        {...messages.profanityError}
        values={{
          guidelinesLink: (
            <Link to="/pages/faq" target="_blank">
              {formatMessage(messages.guidelinesLinkText)}
            </Link>
          ),
        }}
      />
    );
  }

  return <FormattedMessage {...messages.addCommentError} />;
};

export default ErrorMessage;
