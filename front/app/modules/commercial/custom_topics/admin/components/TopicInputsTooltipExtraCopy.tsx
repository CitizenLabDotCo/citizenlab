import React from 'react';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
// components
import Link from 'utils/cl-router/Link';
import messages from './messages';

const TopicInputsCopyProvider = () => {
  return (
    <>
      &nbsp;
      <FormattedMessage
        {...messages.topicInputsTooltipExtraCopy}
        values={{
          topicManagerLink: (
            <Link to="/admin/settings/topics">
              <FormattedMessage {...messages.topicInputsTooltipLink} />
            </Link>
          ),
        }}
      />
    </>
  );
};

export default TopicInputsCopyProvider;
