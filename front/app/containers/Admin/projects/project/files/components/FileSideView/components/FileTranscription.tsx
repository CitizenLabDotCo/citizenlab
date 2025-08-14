import React from 'react';

import {
  Box,
  Text,
  Spinner,
  Accordion,
  Title,
} from '@citizenlab/cl2-component-library';

import useFileTranscript from 'api/file_transcript/useFileTranscript';
import { IFileData } from 'api/files/types';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

const timecodeFormat = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const Timecode = ({ timecode }) => {
  return (
    <Text color="textSecondary" fontSize="s">
      {timecodeFormat(timecode)}
    </Text>
  );
};

type Props = {
  file: IFileData;
};
const FileTranscription = ({ file }: Props) => {
  const { formatMessage } = useIntl();
  const { data: fileTranscript, isError } = useFileTranscript(file.id);

  const transcriptionStatus = fileTranscript?.data.attributes.status;

  return (
    <>
      <Title variant="h3">{formatMessage(messages.transcription)}</Title>
      <Box pt="12px" display="flex">
        {(transcriptionStatus === 'pending' ||
          transcriptionStatus === 'processing') && (
          <Box ml="4px">
            <Spinner size="12px" />
            {formatMessage(messages.transcriptionPending)}
          </Box>
        )}
      </Box>

      {transcriptionStatus === 'completed' && (
        <>
          {fileTranscript?.data.attributes.assemblyai_transcript?.chapters && (
            <Box>
              <Title variant="h4" mt="16px">
                {formatMessage(messages.transcriptionChapters)}
              </Title>
              {fileTranscript.data.attributes.assemblyai_transcript.chapters.map(
                (chapter) => (
                  <Accordion
                    key={chapter.start}
                    title={
                      <Box display="flex" alignItems="center" gap="8px">
                        <Timecode timecode={chapter.start} />
                        <Title variant="h5" p="0" m="0">
                          {chapter.gist}
                        </Title>
                      </Box>
                    }
                  >
                    {chapter.summary}
                  </Accordion>
                )
              )}
            </Box>
          )}

          {fileTranscript?.data.attributes.assemblyai_transcript
            ?.utterances && (
            <Box mt="8px">
              {fileTranscript.data.attributes.assemblyai_transcript.utterances.map(
                (utterance, index) => (
                  <Box key={utterance.start}>
                    <Box display="flex" alignItems="center" gap="8px">
                      <Timecode timecode={utterance.start} />
                      <Title variant="h6" p="0" m="0">
                        {formatMessage(messages.speakerA, {
                          speaker: utterance.speaker,
                        })}
                      </Title>
                    </Box>
                    <Text key={index} color="textSecondary" fontSize="s">
                      {utterance.text}
                    </Text>
                  </Box>
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
