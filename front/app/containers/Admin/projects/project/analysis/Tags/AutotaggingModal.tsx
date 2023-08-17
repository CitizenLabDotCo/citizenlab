import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';

import useLaunchAnalysisAutotagging from 'api/analysis_background_tasks/useLaunchAnalysisAutotagging';
import { TagType } from 'api/analysis_tags/types';

import {
  Box,
  Title,
  Text,
  colors,
  Spinner,
} from '@citizenlab/cl2-component-library';
import Tag from './Tag';

const AutoTagOptionContainer = styled.div<{ disabled: boolean }>`
  background-color: ${colors.grey100};
  border-radius: 3px;
  padding: 16px;
  ${({ disabled }) =>
    disabled
      ? ''
      : `
      cursor: pointer;
      &:hover {
        border: 1px black;
        box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 3px 0px,
          rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;
      }`}
`;

const AutoTagOption = ({
  children,
  tagType,
  title,
  onSelect,
  disabled,
  isLoading,
}: {
  children: ReactNode;
  tagType: TagType;
  title: string;
  onSelect: () => void;
  disabled: boolean;
  isLoading: boolean;
}) => {
  return (
    <AutoTagOptionContainer onClick={() => onSelect()} disabled={disabled}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Tag tagType={tagType} name={title} />
        {isLoading && (
          <Box mx="16px">
            <Spinner size="24px" />
          </Box>
        )}
      </Box>
      <Text my="6px">{children}</Text>
    </AutoTagOptionContainer>
  );
};

const AutotaggingModal = ({ onCloseModal }: { onCloseModal: () => void }) => {
  const { analysisId } = useParams() as { analysisId: string };
  const {
    mutate: launchTagging,
    isLoading,
    variables,
  } = useLaunchAnalysisAutotagging();

  const handleOnSelectMethod = (tagType) => () => {
    if (isLoading) return;

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
      <Box
        display="flex"
        flexDirection="column"
        gap="16px"
        opacity={isLoading ? 0.5 : undefined}
      >
        <AutoTagOption
          tagType="sentiment"
          title="Sentiment"
          onSelect={handleOnSelectMethod('sentiment')}
          disabled={isLoading}
          isLoading={isLoading && variables?.autoTaggingMethod === 'sentiment'}
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
          disabled={isLoading}
          isLoading={isLoading && variables?.autoTaggingMethod === 'nlp_topic'}
        >
          <>Assign new tags, based on topics derived from the text</>
        </AutoTagOption>

        <AutoTagOption
          tagType="controversial"
          title="Controversial"
          onSelect={handleOnSelectMethod('controversial')}
          disabled={isLoading}
          isLoading={
            isLoading && variables?.autoTaggingMethod === 'controversial'
          }
        >
          <>Detect inputs with a significant dislikes/likes ratio</>
        </AutoTagOption>

        <AutoTagOption
          tagType="platform_topic"
          title="Platform tags"
          onSelect={handleOnSelectMethod('platform_topic')}
          disabled={isLoading}
          isLoading={
            isLoading && variables?.autoTaggingMethod === 'platform_topic'
          }
        >
          <>
            Assign the existing platform tags that the author picked when
            posting
          </>
        </AutoTagOption>

        <AutoTagOption
          tagType="language"
          title="Language"
          onSelect={handleOnSelectMethod('language')}
          disabled={isLoading}
          isLoading={isLoading && variables?.autoTaggingMethod === 'language'}
        >
          <>Detect the language of each input</>
        </AutoTagOption>
      </Box>
    </Box>
  );
};

export default AutotaggingModal;
