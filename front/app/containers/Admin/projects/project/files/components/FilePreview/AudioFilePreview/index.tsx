import React, { useEffect, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import axios from 'axios';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

type Props = {
  url: string;
  mimeType: string;
};

type TranscriptResponse = {
  id: string;
};

type PollingResponse = {
  status: 'queued' | 'processing' | 'completed' | 'error';
  text?: string;
  error?: string;
};

const AudioFilePreview: React.FC<Props> = ({ url, mimeType }) => {
  const { formatMessage } = useIntl();

  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = 'https://api.assemblyai.com';

  useEffect(() => {
    const headers = {
      authorization: '03c12127860b41079ed8b5070a8e3c0d',
    };

    let shouldCancel = false;

    const fetchTranscript = async () => {
      try {
        const data = {
          audio_url:
            'https://raw.githubusercontent.com/amanda-anderson/resources/master/MultiSpeakerAudio.mp3',
          speech_model: 'universal',
          speaker_labels: true,
          auto_chapters: true,
        };

        const transcriptUrl = `${baseUrl}/v2/transcript`;
        const response = await axios.post<TranscriptResponse>(
          transcriptUrl,
          data,
          { headers }
        );

        const pollingEndpoint = `${baseUrl}/v2/transcript/${response.data.id}`;

        while (shouldCancel === false) {
          const pollingRes = await axios.get<PollingResponse>(pollingEndpoint, {
            headers,
          });

          if (pollingRes.data.status === 'completed') {
            console.log(pollingRes.data);
            setTranscript(pollingRes.data.text || '');
            break;
          } else if (pollingRes.data.status === 'error') {
            setError(`Transcription failed: ${pollingRes.data.error}`);
            break;
          }

          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      } catch (err: unknown) {
        if (!shouldCancel) {
          if (axios.isAxiosError(err)) {
            setError(err.message);
          } else {
            setError('Unknown error occurred.');
          }
        }
      }
    };

    fetchTranscript();

    return () => {
      shouldCancel = true;
    };
  }, [url]);

  return (
    <Box mt="24px">
      <audio controls style={{ width: '100%' }}>
        <source src={url} type={mimeType} />
        {formatMessage(messages.previewNotSupported)}
      </audio>
      <Box mt="20px">{transcript}</Box>
      {error}
    </Box>
  );
};

export default AudioFilePreview;
