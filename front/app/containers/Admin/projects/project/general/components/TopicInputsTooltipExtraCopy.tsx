import React from 'react';

import Link from 'utils/cl-router/Link';

import { FormattedMessage } from 'utils/cl-intl';
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
