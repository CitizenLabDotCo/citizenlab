import React from 'react';

import { Box, colors, Icon, Text } from '@citizenlab/cl2-component-library';

import { IIdeaData } from 'api/ideas/types';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  idea: IIdeaData;
  direction?: 'row' | 'column';
}

const Engagement = ({ idea, direction = 'row' }: Props) => {
  const { formatMessage } = useIntl();
  const { likes_count, comments_count } = idea.attributes;

  return (
    <Box
      display="flex"
      flexDirection={direction}
      alignItems={direction === 'row' ? 'center' : 'flex-end'}
      gap={direction === 'row' ? '12px' : '6px'}
    >
      <Box display="flex" alignItems="center" gap="4px">
        <Icon
          name="vote-up"
          width="14px"
          height="14px"
          fill={colors.coolGrey600}
          ariaHidden={false}
          title={formatMessage(messages.likes)}
        />
        <Text as="span" m="0" fontSize="xs" color="coolGrey600">
          {likes_count}
        </Text>
      </Box>
      <Box display="flex" alignItems="center" gap="4px">
        <Icon
          name="comments"
          width="14px"
          height="14px"
          fill={colors.coolGrey600}
          ariaHidden={false}
          title={formatMessage(messages.comments)}
        />
        <Text as="span" m="0" fontSize="xs" color="coolGrey600">
          {comments_count}
        </Text>
      </Box>
    </Box>
  );
};

export default Engagement;
