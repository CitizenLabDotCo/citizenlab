import React, { useEffect, useRef } from 'react';

import {
  Box,
  Button,
  colors,
  Icon,
  stylingConsts,
  Text,
} from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { object, string } from 'yup';

import { IFile } from 'api/files/types';

import Feedback from 'components/HookForm/Feedback';
import TextArea from 'components/HookForm/TextArea';

import { useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

import messages from '../messages';

type Props = {
  file: IFile;
};

// TODO: Use this file, once BE ready to support analysis.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FileAnalysis = ({ file }: Props) => {
  const { formatMessage } = useIntl();

  // Ref to scroll to insights to the bottom when new insights are added or on load.
  const insightsDivRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom of insights when the component mounts
  // TODO: Add logic to scroll to the bottom when new insights are added (once implemented in BE).
  useEffect(() => {
    const container = insightsDivRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, []);

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
      <Box
        flex="1"
        overflowY="auto"
        pr="8px"
        mb="16px"
        minHeight="0"
        ref={insightsDivRef}
      >
        <Text fontSize="m" whiteSpace="pre-wrap">
          {/* TODO; Replace with real insights */}
          <Box
            bgColor={colors.grey100}
            borderRadius={stylingConsts.borderRadius}
            p="16px"
          >
            <Text m="0px" color="textPrimary">
              {`This is a sample AI-generated insight created to demonstrate how the system analyzes the contents of this file. It represents the kind of summary or observation that might be produced after reviewing key themes, recurring patterns, or notable trends within the file’s content. Once the file has been processed, this area will display useful insights that can help users quickly understand the main points, areas of concern, or opportunities highlighted in the material.`}
            </Text>
            <Box display="flex" justifyContent="flex-end">
              <Icon width="20px" fill={colors.coolGrey600} name="delete" />
            </Box>
          </Box>
        </Text>
      </Box>

      {/* Question form anchored to bottom */}
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onFormSubmit)}>
          <Box
            background={colors.grey100}
            borderRadius={stylingConsts.borderRadius}
            p="16px"
            display="flex"
            flexDirection="column"
            gap="12px"
          >
            <TextArea name="analysis_question" minRows={1} maxRows={6} />

            <Box
              display="flex"
              justifyContent="flex-end"
              alignItems="center"
              gap="20px"
            >
              <Button icon="stars" size="s" buttonStyle="primary" type="submit">
                {formatMessage(messages.askButton)}
              </Button>
            </Box>
          </Box>
          <Feedback onlyShowErrors={true} />
        </form>
      </FormProvider>
    </Box>
  );
};

export default FileAnalysis;
