import React from 'react';

import { Box, Icon, bo, colors } from '@citizenlab/cl2-component-library';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  ready: boolean;
}

const ReadyMark = ({ ready }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <>
      {ready ? (
        <Icon
          name="check-circle"
          width="16px"
          height="16px"
          fill={bo.colors.stepDone}
          my="0px"
          aria-hidden
        />
      ) : (
        <Box
          flex="0 0 auto"
          w="16px"
          h="16px"
          borderRadius="50%"
          border={`1px dashed ${colors.textPrimary}`}
          aria-hidden
        />
      )}
      <ScreenReaderOnly>
        {formatMessage(ready ? messages.itemReady : messages.itemNotReady)}
      </ScreenReaderOnly>
    </>
  );
};

export default ReadyMark;
