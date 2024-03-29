import React from 'react';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from '../messages';

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
