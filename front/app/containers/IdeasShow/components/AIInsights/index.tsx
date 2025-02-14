import React, { useEffect, useState } from 'react';

import { Box, Button, Text, colors } from '@citizenlab/cl2-component-library';

import { IAuthoringAssistanceData } from 'api/authoring_assistance/types';
import useAddAuthoringAssistance from 'api/authoring_assistance/useAuthoringAssistance';
import { IIdea } from 'api/ideas/types';

import IdeaCard from 'components/IdeaCard';
import TextArea from 'components/UI/TextArea';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const AIInsights = ({ idea }: { idea: IIdea }) => {
  const { formatMessage } = useIntl();
  const { mutate: addAuthoringAssistance } = useAddAuthoringAssistance();
  const [promptData, setPromptData] = useState<IAuthoringAssistanceData | null>(
    null
  );

  // Stores the user input from the TextArea
  const [customPrompt, setCustomPrompt] = useState<string>('');

  const fetchAssistance = (regenerate: boolean) => {
    addAuthoringAssistance(
      {
        id: idea.data.id,
        custom_free_prompt: customPrompt,
        regenerate,
      },
      {
        onSuccess: (data) => {
          setPromptData(data.data);
          setCustomPrompt(data.data.attributes.custom_free_prompt);
        },
      }
    );
  };

  useEffect(() => {
    fetchAssistance(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTextChange = (value: string) => {
    setCustomPrompt(value);
  };
  const similarIdeaIds =
    promptData?.attributes.prompt_response.duplicate_inputs;

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
      <Text>{formatMessage(messages.promptTitle)}</Text>

      <Box w="100%">
        <TextArea
          minRows={5}
          value={customPrompt}
          onChange={handleTextChange}
          placeholder={formatMessage(messages.textAreaPlaceholder)}
        />
      </Box>

      <Button onClick={() => fetchAssistance(true)}>
        {formatMessage(messages.regenegareteInsights)}
      </Button>
      <Text>
        {promptData?.attributes.prompt_response.custom_free_prompt_response}
      </Text>
      {similarIdeaIds && similarIdeaIds.length > 1 && (
        <Box mt="10px">
          <Text>{formatMessage(messages.similarIdeas)}</Text>
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

export default AIInsights;
