import React from 'react';

import Button from 'components/UI/Button';
import { colors } from '@citizenlab/cl2-component-library';
import messages from '../messages';
import { useIntl } from 'utils/cl-intl';

interface Props {
  slug: string;
}

const ReadMoreButton = ({ slug }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Button
      linkTo={`/ideas/${slug}?go_back=true`}
      size="s"
      textColor={colors.coolGrey700}
      mr="8px"
      ml="auto"
      m="0px"
      p="0px"
      buttonStyle="text"
    >
      <u>{formatMessage(messages.readMore)}</u>
    </Button>
  );
};

export default ReadMoreButton;
