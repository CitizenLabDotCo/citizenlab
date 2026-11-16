import React from 'react';

// The design-system icon set has no globe.
import { Icon } from '@citizenlab/cl2-component-library';
import 'design-system/tokens.css';
import Tooltip from 'design-system/Tooltip';
import { Focusable } from 'react-aria-components';

import dateTimeMessages from 'containers/Admin/projects/project/events/components/DateTimeSelection/messages';

import { useIntl } from 'utils/cl-intl';
import { getGmtOffset } from 'utils/dateUtils';

import messages from './messages';
import styles from './PlatformTimeNote.module.css';

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
      {/* Focusable lets the tooltip open on keyboard focus of plain text. */}
      <Focusable>
        <span className={styles.note} tabIndex={0}>
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
        </span>
      </Focusable>
    </Tooltip>
  );
};

export default PlatformTimeNote;
