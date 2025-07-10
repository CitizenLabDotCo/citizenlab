import React from 'react';

import { Box, Button, colors, Text } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { object, string } from 'yup';

import { IFile } from 'api/files/types';

import TextArea from 'components/HookForm/TextArea';

import { useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

import messages from '../messages';

type Props = {
  file: IFile;
};

const FileAnalysis = ({ file }: Props) => {
  const { formatMessage } = useIntl();

  const schema = object({
    analysis_question: string(),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues: {
      analysis_question: '',
    },
    resolver: yupResolver(schema),
  });

  const onFormSubmit = async () => {
    try {
      // TODO: Submit the analysis question to the backend.
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      flex="1"
      minHeight="0"
      style={{ height: '100%', maxHeight: '92dvh', overflow: 'hidden' }}
    >
      {/* Scrollable insights list */}
      <Box flex="1" overflowY="auto" pr="8px" mb="16px" minHeight="0">
        <Text fontSize="m" whiteSpace="pre-wrap">
          {/* TODO; Replace with real insights */}
          {`This is a sample AI-generated insight created to demonstrate how the system analyzes the contents of this file. It represents the kind of summary or observation that might be produced after reviewing key themes, recurring patterns, or notable trends within the file’s content. Once the file has been processed, this area will display useful insights that can help users quickly understand the main points, areas of concern, or opportunities highlighted in the material.
`.repeat(10)}
        </Text>
      </Box>

      {/* Question form anchored to bottom */}
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onFormSubmit)}>
          <Box
            background={colors.grey100}
            borderRadius="8px"
            p="16px"
            display="flex"
            flexDirection="column"
            gap="12px"
          >
            <TextArea name="analysis_question" minRows={1} maxRows={6} />

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              gap="20px"
            >
              <Text fontSize="s" color="textSecondary">
                {/* TODO: Replace with real count once supported by BE */}
                123/1234
              </Text>
              <Button icon="stars" size="s" buttonStyle="primary" type="submit">
                {formatMessage(messages.askButton)}
              </Button>
            </Box>
          </Box>
        </form>
      </FormProvider>
    </Box>
  );
};

export default FileAnalysis;
