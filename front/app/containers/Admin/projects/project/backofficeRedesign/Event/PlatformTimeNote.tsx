import React from 'react';

import {
  Box,
  Icon,
  Text,
  Tooltip,
  colors,
} from '@citizenlab/cl2-component-library';

import dateTimeMessages from 'containers/Admin/projects/project/events/components/DateTimeSelection/messages';

import { useIntl } from 'utils/cl-intl';
import { getGmtOffset } from 'utils/dateUtils';

import messages from './messages';

interface Props {
  timezone: string;
  now: Date;
}

const PlatformTimeNote = ({ timezone, now }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Tooltip
      content={formatMessage(dateTimeMessages.timezoneInfo, {
        timezone: timezone.replace(/_/g, ' '),
        gmtOffset: getGmtOffset(timezone, now),
      })}
      theme="dark"
    >
      <Box display="flex" alignItems="center" gap="6px" tabIndex={0}>
        <Icon
          name="globe"
          width="14px"
          height="14px"
          fill={colors.coolGrey600}
        />
        <Text as="span" m="0" fontSize="xs" color="coolGrey600">
          {formatMessage(messages.platformTime, { timezone })}
        </Text>
      </Box>
    </Tooltip>
  );
};

export default PlatformTimeNote;
