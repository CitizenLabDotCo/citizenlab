import React from 'react';

import {
  Box,
  Button,
  Divider,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { getTopicProgressBarColor } from '../topicsColor';

interface Props {
  topicId: string;
  topicTitle: string;
  topicDescription: string;
  isActive: boolean;
  totalIdeasCount: number;
  topicCount: number;
  onTopicSelect: (topicId: string) => void;
}

const StyledButton = styled(Button)`
  .buttonText {
    width: 100%;
  }
`;

const TopicItem = ({
  topicId,
  topicTitle,
  topicDescription,
  isActive,
  totalIdeasCount,
  topicCount,
  onTopicSelect,
}: Props) => {
  const percentage =
    totalIdeasCount > 0 ? (topicCount / totalIdeasCount) * 100 : 0;
  const topicColor = getTopicProgressBarColor(topicId);

  return (
    <>
      <Box
        as={StyledButton}
        buttonStyle="secondary-outlined"
        background={isActive ? colors.teal100 : 'transparent'}
        onClick={() => onTopicSelect(topicId)}
        borderColor="transparent"
        justify="left"
      >
        <Text mb="0px">{topicTitle}</Text>
        <Text m="0px" variant="bodyS">
          {topicDescription}
        </Text>
        <Box mt="8px" w="100%">
          <Box
            width="100%"
            height="8px"
            borderRadius="4px"
            overflow="hidden"
            border={`1px solid ${colors.grey300}`}
          >
            <Box
              width={`${percentage}%`}
              height="100%"
              background={topicColor}
              style={{
                transition: 'width 0.3s ease',
                minWidth: topicCount > 0 ? '2%' : '0%',
              }}
            />
          </Box>

          <Text variant="bodyS">
            {topicCount} {topicCount === 1 ? 'idea' : 'ideas'}
          </Text>
        </Box>
      </Box>

      <Divider m="0px" />
    </>
  );
};

export default TopicItem;
