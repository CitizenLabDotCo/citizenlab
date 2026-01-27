import React from 'react';

import {
  Box,
  Button,
  Divider,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useInputTopicById from 'api/input_topics/useInputTopicById';

import useLocalize from 'hooks/useLocalize';

import { getTopicColor, getTopicProgressBarColor } from '../topicsColor';

interface Props {
  topicId: string;
  isActive: boolean;
  totalIdeasCount: number;
  topicCount: number;
  onTopicSelect: (topicId: string) => void;
  isLast?: boolean;
}

const StyledButton = styled(Button)`
  .buttonText {
    width: 100%;
  }
`;

const TopicItem = ({
  topicId,
  isActive,
  totalIdeasCount,
  topicCount,
  onTopicSelect,
  isLast = false,
}: Props) => {
  const { data: topic } = useInputTopicById(topicId);
  const localize = useLocalize();
  const percentage =
    totalIdeasCount > 0 ? (topicCount / totalIdeasCount) * 100 : 0;
  const topicColor = getTopicProgressBarColor(topicId);
  const topicBackgroundColor = getTopicColor(topicId);
  return (
    <>
      <Box
        as={StyledButton}
        buttonStyle="secondary-outlined"
        background={isActive ? colors.teal100 : 'transparent'}
        onClick={() => onTopicSelect(topicId)}
        borderColor="transparent"
        justify="left"
        pt="16px"
        pb="28px"
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          w="100%"
        >
          <Text mb="0px" fontWeight="bold" variant="bodyL">
            {localize(topic?.data.attributes.title_multiloc)}
          </Text>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minWidth="40px"
            height="40px"
            borderRadius="50%"
            background={topicBackgroundColor}
          >
            <Text m="0px" fontWeight="bold" variant="bodyS">
              {topicCount}
            </Text>
          </Box>
        </Box>
        <Text m="0px" variant="bodyM">
          {localize(topic?.data.attributes.description_multiloc)}
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
        </Box>
      </Box>

      {!isLast && <Divider m="0px" />}
    </>
  );
};

export default TopicItem;
