import React, { ReactNode } from 'react';

import { bo, Box, colors, Icon, Text } from '@citizenlab/cl2-component-library';
import { format, parseISO } from 'date-fns';

import { IPhaseData } from 'api/phases/types';

import useLocale from 'hooks/useLocale';

import { phaseStatus } from 'containers/Admin/projects/project/projectPage/phaseRowUtils';

import { getLocale } from 'components/admin/DatePickers/_shared/locales';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  phase: IPhaseData;
}

const AutoShareNotice = ({ phase }: Props) => {
  const { formatMessage } = useIntl();
  const dateLocale = getLocale(useLocale());
  const { end_at: endAt } = phase.attributes;

  let notice: ReactNode = formatMessage(messages.autoShareNoticeNoEndDate);
  if (phaseStatus(phase) === 'past') {
    notice = formatMessage(messages.autoShareNoticeEnded);
  } else if (endAt) {
    notice = (
      <FormattedMessage
        {...messages.autoShareNotice}
        values={{
          date: (
            <Text as="span" variant="boControl" m="0">
              {format(parseISO(endAt), 'd MMMM yyyy', { locale: dateLocale })}
            </Text>
          ),
        }}
      />
    );
  }

  return (
    <Box
      display="flex"
      alignItems="flex-start"
      gap="8px"
      p="12px"
      borderRadius={bo.borderRadius}
      background={colors.grey100}
      role="status"
    >
      <Box flex="0 0 auto" display="flex" mt="2px">
        <Icon
          name="info-outline"
          width="16px"
          height="16px"
          fill={colors.coolGrey500}
          aria-hidden
        />
      </Box>
      <Text variant="boControl" color="coolGrey700" m="0">
        {notice}
      </Text>
    </Box>
  );
};

export default AutoShareNotice;
