const API_KEY_MISTRAL = 'EJkOoA87f97RpWPplkWire60IptycFoQ';

import React, { useEffect, useState } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';
import axios from 'axios';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

type Props = {
  url: string;
  mimeType: string;
};

type AssemblyAITranscriptResponse = {
  id: string;
};

type AssemblyAIPollingResponse = {
  status: 'queued' | 'processing' | 'completed' | 'error';
  text?: string;
  error?: string;
};

type MistralTranscriptResponse = {
  model: string;
  text: string;
  language: string | null;
  segments?: Array<{
    text: string;
    start: number;
    end: number;
  }>;
  usage: {
    prompt_audio_seconds: number;
    prompt_tokens: number;
    total_tokens: number;
    completion_tokens: number;
  };
};

const AudioFilePreview: React.FC<Props> = ({ url, mimeType }) => {
  const { formatMessage } = useIntl();

  const [transcript, setTranscript] = useState<string | null>(null);
  const [fetchAssemblyAITranscript, setFetchAssemblyAITranscript] =
    useState(false);
  const [fetchMistralTranscript, setFetchMistralTranscript] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transcriptionSource, setTranscriptionSource] = useState<
    'assemblyai' | 'mistral' | null
  >(null);

  const assemblyAIBaseUrl = 'https://api.assemblyai.com';
  const mistralBaseUrl = 'https://api.mistral.ai';

  // AssemblyAI transcription logic (existing)
  useEffect(() => {
    const headers = {
      authorization: '03c12127860b41079ed8b5070a8e3c0d',
    };

    let shouldCancel = false;

    const fetchTranscript = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setTranscriptionSource('assemblyai');

        const data = {
          audio_url:
            'https://raw.githubusercontent.com/amanda-anderson/resources/master/MultiSpeakerAudioTrimmed.mp3', // Use the actual URL instead of hardcoded one
          speech_model: 'universal',
          speaker_labels: true,
          auto_chapters: true,
        };

        const transcriptUrl = `${assemblyAIBaseUrl}/v2/transcript`;
        const response = await axios.post<AssemblyAITranscriptResponse>(
          transcriptUrl,
          data,
          { headers }
        );

        const pollingEndpoint = `${assemblyAIBaseUrl}/v2/transcript/${response.data.id}`;

        while (shouldCancel === false) {
          const pollingRes = await axios.get<AssemblyAIPollingResponse>(
            pollingEndpoint,
            {
              headers,
            }
          );

          if (pollingRes.data.status === 'completed') {
            console.log(pollingRes.data);
            setTranscript(pollingRes.data.text || '');
            setIsLoading(false);
            break;
          } else if (pollingRes.data.status === 'error') {
            setError(
              `AssemblyAI transcription failed: ${pollingRes.data.error}`
            );
            setIsLoading(false);
            break;
          }

          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      } catch (err: unknown) {
        if (!shouldCancel) {
          setIsLoading(false);
          if (axios.isAxiosError(err)) {
            setError(`AssemblyAI error: ${err.message}`);
          } else {
            setError('Unknown AssemblyAI error occurred.');
          }
        }
      }
    };

    if (fetchAssemblyAITranscript) {
      fetchTranscript();
    }

    return () => {
      shouldCancel = true;
    };
  }, [fetchAssemblyAITranscript, url]);

  // Mistral transcription logic
  useEffect(() => {
    const fetchMistralTranscription = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setTranscriptionSource('mistral');

        // First, we need to fetch the audio file as a blob
        const audioUrl =
          'https://raw.githubusercontent.com/amanda-anderson/resources/master/MultiSpeakerAudioTrimmed.mp3';
        const audioResponse = await axios.get(audioUrl, {
          responseType: 'blob',
        });

        // Create FormData for multipart/form-data request
        const formData = new FormData();

        // Extract filename from URL or use a default
        const filename = audioUrl.split('/').pop() || 'audio.mp3';

        // Only send the required parameters first
        formData.append('file', audioResponse.data, filename);
        formData.append('model', 'voxtral-mini-latest');

        // Debug: Log what we're sending
        console.log('FormData contents:');
        for (const [key, value] of formData.entries()) {
          console.log(key, value);
        }

        // Let's try without optional parameters first
        // formData.append('timestamp_granularities[]', 'segment');
        // formData.append('language', 'en');

        const headers = {
          Authorization: `Bearer ${API_KEY_MISTRAL}`,
          // Don't set Content-Type - let axios set it automatically for multipart/form-data
        };

        const transcriptUrl = `${mistralBaseUrl}/v1/audio/transcriptions`;
        const response = await axios.post<MistralTranscriptResponse>(
          transcriptUrl,
          formData,
          { headers }
        );

        console.log('Mistral response:', response.data);
        setTranscript(response.data.text);
        setIsLoading(false);
      } catch (err: unknown) {
        setIsLoading(false);
        if (axios.isAxiosError(err)) {
          setError(
            `Mistral error: ${err.response?.data?.message || err.message}`
          );
        } else {
          setError('Unknown Mistral error occurred.');
        }
      }
    };

    if (fetchMistralTranscript) {
      fetchMistralTranscription();
    }
  }, [fetchMistralTranscript, url]);

  const handleAssemblyAITranscript = () => {
    setTranscript(null);
    setError(null);
    setFetchAssemblyAITranscript(true);
    setFetchMistralTranscript(false);
  };

  const handleMistralTranscript = () => {
    setTranscript(null);
    setError(null);
    setFetchMistralTranscript(true);
    setFetchAssemblyAITranscript(false);
  };

  return (
    <Box mt="24px">
      <audio controls style={{ width: '100%' }}>
        <source src={url} type={mimeType} />
        {formatMessage(messages.previewNotSupported)}
      </audio>

      <Box mt="12px" display="flex" gap="12px">
        <Button onClick={handleAssemblyAITranscript} disabled={isLoading}>
          {isLoading && transcriptionSource === 'assemblyai'
            ? 'Transcribing...'
            : 'Transcribe - AssemblyAI'}
        </Button>

        <Button onClick={handleMistralTranscript} disabled={isLoading}>
          {isLoading && transcriptionSource === 'mistral'
            ? 'Transcribing...'
            : 'Transcribe - Mistral'}
        </Button>
      </Box>

      {transcript && (
        <Box mt="20px">
          <h4>
            Transcript (
            {transcriptionSource === 'assemblyai' ? 'AssemblyAI' : 'Mistral'}):
          </h4>
          <Box p="12px" borderRadius="4px" style={{ whiteSpace: 'pre-wrap' }}>
            {transcript}
          </Box>
        </Box>
      )}

      {error && (
        <Box mt="12px" color="red">
          {error}
        </Box>
      )}
    </Box>
  );
};

export default AudioFilePreview;
