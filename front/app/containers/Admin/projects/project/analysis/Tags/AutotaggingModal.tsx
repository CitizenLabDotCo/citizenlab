import { Box, Title, Text, colors } from '@citizenlab/cl2-component-library';
import { TagType } from 'api/analysis_tags/types';
import React, { ReactNode } from 'react';

import useLaunchAnalysisAutotagging from 'api/analysis_background_tasks/useLaunchAnalysisAutotagging';
import { useParams } from 'react-router-dom';
import { TagTypeColorMap } from './Tag';
import styled from 'styled-components';

const AutoTagOptionContainer = styled.div`
  cursor: pointer;
  background-color: ${colors.grey100};
  border-radius: 3px;
  display: flex;
  align-items: center;
  gap: 20px;
  &:hover {
    border: 1px black;
    box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 3px 0px,
      rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;
  }
  min-height: 90px;
`;

const AutoTagOption = ({
  children,
  tagType,
  title,
  onSelect,
}: {
  children: ReactNode;
  tagType: TagType;
  title: string;
  onSelect: () => void;
}) => {
  return (
    <AutoTagOptionContainer onClick={() => onSelect()}>
      <Box
        color={TagTypeColorMap[tagType].text}
        background={TagTypeColorMap[tagType].background}
        px="12px"
        py="4px"
        flex="0 0 160px"
        ml="-14px"
        boxShadow="rgba(50, 50, 105, 0.15) 0px 2px 5px 0px, rgba(0, 0, 0, 0.05) 0px 1px 1px 0px;"
      >
        {title}
      </Box>
      <Text px="20px">{children}</Text>
    </AutoTagOptionContainer>
  );
};

const AutotaggingModal = ({ onCloseModal }: { onCloseModal: () => void }) => {
  const { analysisId } = useParams() as { analysisId: string };
  const { mutate: launchTagging } = useLaunchAnalysisAutotagging();

  const handleOnSelectMethod = (tagType) => () => {
    launchTagging(
      { analysisId, autoTaggingMethod: tagType },
      {
        onSuccess: () => {
          onCloseModal();
        },
      }
    );
  };
  return (
    <Box px="24px">
      <Title mb="32px">What tags do you want to add?</Title>
      <Text mb="32px">
        Auto-tags are automatically derived by the computer. You can change or
        remove them at all times.
      </Text>
      <Box display="flex" flexDirection="column" gap="16px">
        <AutoTagOption
          tagType="sentiment"
          title="Sentiment"
          onSelect={handleOnSelectMethod('sentiment')}
        >
          <>
            Assign a positive or negative sentiment to each input, derived from
            the text
          </>
        </AutoTagOption>

        <AutoTagOption
          tagType="nlp_topic"
          title="AI tags"
          onSelect={handleOnSelectMethod('nlp_topic')}
        >
          <>Assign new tags, based on topics derived from the text</>
        </AutoTagOption>

        <AutoTagOption
          tagType="language"
          title="Language"
          onSelect={handleOnSelectMethod('language')}
        >
          <>Detect the language of each input</>
        </AutoTagOption>

        <AutoTagOption
          tagType="controversial"
          title="Controversial"
          onSelect={handleOnSelectMethod('controversial')}
        >
          <>Detect inputs with a significant dislikes/likes ratio</>
        </AutoTagOption>

        <AutoTagOption
          tagType="platform_topic"
          title="Platform tags"
          onSelect={handleOnSelectMethod('platform_topic')}
        >
          <>
            Assign the existing platform tags that the author picked when
            posting
          </>
        </AutoTagOption>
      </Box>
    </Box>
  );
};

export default AutotaggingModal;
