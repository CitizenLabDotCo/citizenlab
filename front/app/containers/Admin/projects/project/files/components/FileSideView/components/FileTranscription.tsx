import React from 'react';

import { Box, Label, Text, Spinner } from '@citizenlab/cl2-component-library';

import useFileTranscript from 'api/file_transcript/useFileTranscript';
import { IFileData } from 'api/files/types';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

type Props = {
  file: IFileData;
};
const FileTranscription = ({ file }: Props) => {
  const { formatMessage } = useIntl();
  const { data: fileTranscript, isError } = useFileTranscript(file.id);

  const transcriptionStatus = fileTranscript?.data.attributes.status;

  return (
    <>
      <Box pt="12px" display="flex">
        <Label>
          {formatMessage(messages.transcription)}
          {(transcriptionStatus === 'pending' ||
            transcriptionStatus === 'processing') && (
            <Box ml="4px">
              <Spinner size="12px" />
            </Box>
          )}
        </Label>
      </Box>
      {transcriptionStatus === 'completed' && (
        <>
          {fileTranscript?.data.attributes.assemblyai_transcript
            ?.utterances && (
            <Box mt="8px">
              {fileTranscript.data.attributes.assemblyai_transcript.utterances.map(
                (utterance, index) => (
                  <Text key={index} color="textSecondary" fontSize="s">
                    {utterance.speaker}: {utterance.text}
                  </Text>
                )
              )}
            </Box>
          )}
        </>
      )}
      {(transcriptionStatus === 'failed' || isError) && (
        <Text color="textSecondary" fontSize="s">
          {formatMessage(messages.unableToGenerateTranscription)}
        </Text>
      )}
    </>
  );
};

export default FileTranscription;
