import React from 'react';

import { Box, IconTooltip } from '@citizenlab/cl2-component-library';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../../../messages';

const HeatmapTooltipContent = () => {
  const { formatMessage } = useIntl();
  return (
    <Box display="flex">
      {formatMessage(messages.heatmapView)}
      <Box pl="4px">
        <IconTooltip
          placement="top-start"
          content={
            <FormattedMessage
              {...messages.heatmapToggleTooltip}
              values={{
                heatmapToggleEsriLinkText: (
                  <a
                    href={formatMessage(messages.heatmapToggleEsriLink)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Box mt="16px">
                      <FormattedMessage
                        {...messages.heatmapToggleEsriLinkText}
                      />
                    </Box>
                  </a>
                ),
              }}
            />
          }
        />
      </Box>
    </Box>
  );
};

export default HeatmapTooltipContent;
