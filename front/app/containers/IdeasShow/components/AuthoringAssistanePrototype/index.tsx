// This code is a prototype for input authoring. Clean-up will follow after the prototype phase.
import React, { useEffect, useState } from 'react';

import {
  Box,
  Button,
  Text,
  Title,
  colors,
} from '@citizenlab/cl2-component-library';

import useAddAuthoringAssistance from 'api/authoring_assistance/useAuthoringAssistance';

import useFeatureFlag from 'hooks/useFeatureFlag';

import IdeaCard from 'components/IdeaCard';
import TextArea from 'components/UI/TextArea';

const AuthoringAssistanePrototype = ({ ideaId }: { ideaId: string }) => {
  const isAuthoringAssistanceOn = useFeatureFlag({
    name: 'authoring_assistance_prototype',
  });

  const [customPrompt, setCustomPrompt] = useState<string>('');
  const {
    mutate: addAuthoringAssistance,
    data: authoringResponse,
    isLoading,
  } = useAddAuthoringAssistance();
  const promptData = authoringResponse?.data;
  const similarIdeaIds =
    promptData?.attributes.prompt_response.duplicate_inputs;
  const customFreePromptResponse =
    promptData?.attributes.prompt_response.custom_free_prompt_response;
  const toxicityLabel = promptData?.attributes.prompt_response.toxicity_label;
  const toxicityAIReason = promptData?.attributes.prompt_response.ai_reason;
  const fetchAssistance = (regenerate: boolean) => {
    addAuthoringAssistance({
      id: ideaId,
      custom_free_prompt:
        customPrompt || promptData?.attributes.custom_free_prompt || '',
      regenerate,
    });
  };

  useEffect(() => {
    if (isAuthoringAssistanceOn) {
      fetchAssistance(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTextChange = (value: string) => {
    setCustomPrompt(value);
  };

  if (!isAuthoringAssistanceOn) return null;

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="flex-start"
      background={colors.background}
      w="100%"
      flexDirection="column"
      p="20px"
    >
      <Text>Prompt:</Text>

      <Box w="100%">
        <TextArea
          minRows={5}
          value={customPrompt || promptData?.attributes.custom_free_prompt}
          onChange={handleTextChange}
          placeholder="Add custom prompts here:"
        />
      </Box>

      <Button onClick={() => fetchAssistance(true)} processing={isLoading}>
        Regenerate insights
      </Button>

      {typeof customFreePromptResponse == 'string' && (
        <>
          <Title variant="h4">Insights</Title>
          <Text whiteSpace="pre-wrap">{customFreePromptResponse}</Text>
        </>
      )}

      {typeof toxicityLabel === 'string' && (
        <Title variant="h4">Toxicity: {toxicityLabel}</Title>
      )}

      {typeof toxicityAIReason === 'string' && (
        <Text whiteSpace="pre-wrap">{toxicityAIReason}</Text>
      )}

      {similarIdeaIds && similarIdeaIds.length > 1 && (
        <Box mt="10px">
          <Text>Similar ideas</Text>
          {similarIdeaIds.map((ideaId) => (
            <IdeaCard
              key={ideaId}
              ideaId={ideaId}
              hideImage
              hideIdeaStatus
              hideImagePlaceholder
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default AuthoringAssistanePrototype;
