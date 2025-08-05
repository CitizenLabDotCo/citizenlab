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

import Feedback from 'components/HookForm/Feedback';
import TextArea from 'components/HookForm/TextArea';

import { useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

import messages from '../../messages';

const FileAnalysis = () => {
  const { formatMessage } = useIntl();

  // Ref for scrolling the insights list to the bottom.
  const insightsDivRef = useRef<HTMLDivElement>(null);

  // UseEffect to scroll to the bottom of insights when the component mounts
  // TODO: Add logic to scroll to the bottom when new insights are added (once implemented in BE).
  useEffect(() => {
    const container = insightsDivRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  // Setup for analysis question form
  const schema = object({
    analysis_question: string().required(),
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
      // TODO: Submit the analysis question to the backend once implemented.
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
      maxHeight="100dvh"
      overflow="hidden"
      height="100%"
    >
      {/* Scrollable insights list */}
      <Box
        mt="20px"
        flex="1"
        overflowY="auto"
        pr="8px"
        mb="16px"
        ref={insightsDivRef}
      >
        <Box
          bgColor={colors.grey100}
          borderRadius={stylingConsts.borderRadius}
          p="16px"
        >
          {/* TODO: Remove sample once BE implemented. */}
          <Text m="0px" color="textPrimary" fontSize="m" whiteSpace="pre-wrap">
            {`This is a sample AI-generated insight created to demonstrate how the system analyzes the contents of this file. It represents the kind of summary or observation that might be produced after reviewing key themes, recurring patterns, or notable trends within the file’s content. Once the file has been processed, this area will display useful insights that can help users quickly understand the main points, areas of concern, or opportunities highlighted in the material.`}
          </Text>
          <Box display="flex" justifyContent="flex-end">
            {/* TODO: Make this a clickable icon button for deleting the insight. */}
            <Icon width="20px" fill={colors.coolGrey600} name="delete" />
          </Box>
        </Box>
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
              <Button
                icon="stars"
                size="s"
                buttonStyle="primary"
                type="submit"
                disabled={methods.formState.isSubmitting}
              >
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
