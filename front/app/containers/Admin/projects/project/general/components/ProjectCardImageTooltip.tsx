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
          {...messages.projectCardImageTooltip}
          values={{
            supportPageLink: (
              <a
                href={formatMessage(messages.imageSupportPageURL2)}
                target="_blank"
                rel="noreferrer"
              >
                <FormattedMessage {...messages.supportPageLinkText} />
              </a>
            ),
          }}
        />
      }
    />
  );
};
export default ProjectCardImageTooltip;
