import React from 'react';

import Banner from 'design-system/Banner';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  count: number;
  onShow: () => void;
}

const AwaitingReply = ({ count, onShow }: Props) => {
  const { formatMessage } = useIntl();

  if (count === 0) return null;

  return (
    <Banner
      tone="warning"
      action={{
        label: formatMessage(messages.showAwaitingReply),
        onPress: onShow,
      }}
    >
      {formatMessage(messages.awaitingReply, { count })}
    </Banner>
  );
};

export default AwaitingReply;
