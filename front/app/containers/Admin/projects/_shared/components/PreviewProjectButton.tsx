import React from 'react';

import IconButton from 'design-system/IconButton';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from './messages';

interface Props {
  slug: string;
}

const PreviewProjectButton = ({ slug }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <IconButton
      variant="bordered"
      icon="eye-16"
      aria-label={formatMessage(messages.previewProject)}
      onPress={() => clHistory.push(`/projects/${slug}`)}
    />
  );
};

export default PreviewProjectButton;
