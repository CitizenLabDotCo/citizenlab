import React from 'react';

// The design-system icon set has no globe.
import { Icon } from '@citizenlab/cl2-component-library';

import Tooltip, { TooltipTarget } from 'design-system/Tooltip';

import dateTimeMessages from 'containers/Admin/projects/project/events/components/DateTimeSelection/messages';

import { useIntl } from 'utils/cl-intl';
import { getGmtOffset } from 'utils/dateUtils';

import messages from './messages';
import styles from './PlatformTimeNote.module.css';
import 'design-system/tokens.css';

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
    >
      <TooltipTarget className={styles.note}>
        <Icon
          name="globe"
          width="14px"
          height="14px"
          fill="currentColor"
          className={styles.icon}
        />
        <span className={styles.text}>
          {formatMessage(messages.platformTime, { timezone })}
        </span>
      </TooltipTarget>
    </Tooltip>
  );
};

export default PlatformTimeNote;
