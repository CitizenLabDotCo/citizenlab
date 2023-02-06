import React from 'react';

import { IconTooltip } from '@citizenlab/cl2-component-library';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../messages';

const ProjectCardImageTooltip = () => {
  const { formatMessage } = useIntl();

  return (
    <IconTooltip
      content={
        <FormattedMessage
          {...messages.headerImageTooltip}
          values={{
            supportPageLink: (
              <a
                href={formatMessage(messages.headerImageSupportPageURL)}
                target="_blank"
                rel="noreferrer"
              >
                <FormattedMessage {...messages.headerImageSupportPageText} />
              </a>
            ),
          }}
        />
      }
    />
  );
};
export default ProjectCardImageTooltip;
