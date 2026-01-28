import React from 'react';

import {
  Box,
  Button,
  colors,
  Divider,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import useInputTopicById from 'api/input_topics/useInputTopicById';
import useInputTopics from 'api/input_topics/useInputTopics';

import T from 'components/T';
import GoBackButton from 'components/UI/GoBackButton';

import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

import messages from '../messages';
import { getTopicColor } from '../topicsColor';

interface Props {
  projectId: string;
  topicId: string;
  topicCount: number;
  topicCounts: Record<string, number>;
  onBack: () => void;
  isMobile?: boolean;
}

const StyledButton = styled(Button)`
  .buttonText {
    width: 100%;
  }
`;

const SelectedTopicContent = ({
  projectId,
  topicId,
  topicCount,
  topicCounts,
  onBack,
}: Props) => {
  const [searchParams] = useSearchParams();
  const selectedSubtopicId = searchParams.get('subtopic');

  const { data: topic } = useInputTopicById(topicId);
  const { data: subtopics } = useInputTopics(projectId, {
    parent_id: topicId,
    depth: 1,
  });

  const handleSubtopicClick = (subtopicId: string) => {
    if (selectedSubtopicId === subtopicId) {
      removeSearchParams(['subtopic']);
    } else {
      updateSearchParams({ subtopic: subtopicId });
    }
  };

  return (
    <>
      <Box mb="16px">
        <GoBackButton
          onClick={onBack}
          customMessage={messages.allTopics}
          size="s"
        />
      </Box>

      <Box px="16px" mb="16px">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb="8px"
        >
          <Title as="h1" variant="h3" mb="0px">
            <T value={topic?.data.attributes.title_multiloc} />
          </Title>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minWidth="40px"
            height="40px"
            borderRadius="50%"
            background={getTopicColor(topicId)}
          >
            <Text m="0px" fontWeight="bold" variant="bodyS">
              {topicCount}
            </Text>
          </Box>
        </Box>
        <Text variant="bodyS" color="coolGrey600">
          <T value={topic?.data.attributes.description_multiloc} supportHtml />
        </Text>
      </Box>

      {subtopics?.data.map((subtopic) => {
        const isActive = selectedSubtopicId === subtopic.id;
        return (
          <React.Fragment key={subtopic.id}>
            <Divider m="0px" />
            <Box
              as={StyledButton}
              buttonStyle="secondary-outlined"
              bgColor={isActive ? colors.grey100 : 'transparent'}
              onClick={() => handleSubtopicClick(subtopic.id)}
              borderColor="transparent"
              justify="left"
              py="12px"
              px="16px"
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb="4px"
                w="100%"
              >
                <Text fontWeight="bold" variant="bodyM" mb="0px">
                  <T value={subtopic.attributes.title_multiloc} supportHtml />
                </Text>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  minWidth="28px"
                  height="28px"
                  borderRadius="50%"
                  background={getTopicColor(topicId)}
                >
                  <Text m="0px" fontWeight="bold" variant="bodyXs">
                    {topicCounts[subtopic.id] || 0}
                  </Text>
                </Box>
              </Box>
              <Text variant="bodyS" color="coolGrey600" m="0px">
                <T
                  value={subtopic.attributes.description_multiloc}
                  supportHtml
                />
              </Text>
            </Box>
          </React.Fragment>
        );
      })}
    </>
  );
};

export default SelectedTopicContent;
