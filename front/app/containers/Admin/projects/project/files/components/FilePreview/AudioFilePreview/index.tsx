import React, { useRef, useCallback, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IFileData } from 'api/files/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import FileTranscription from './FileTranscription';

export interface AudioRef {
  readonly currentTime: number;
  readonly duration: number;
  readonly paused: boolean;
  setCurrentTime: (time: number) => void;
  play: () => Promise<void>;
  pause: () => void;
  getAudioElement: () => HTMLAudioElement | null;
}

type Props = {
  url: string;
  title?: string;
  mimeType: string;
  file: IFileData;
};

const AudioFilePreview = ({ url, title, mimeType, file }: Props) => {
  const audioElementRef = useRef<HTMLAudioElement>(null);
  const [currentAudioTime, setCurrentAudioTime] = useState<number>(0);
  const [shouldScrollToActive, setShouldScrollToActive] = useState(false);

  const isTranscriptionActive = useFeatureFlag({
    name: 'data_repository_transcription',
  });

  // Create internal audioRef object for FileTranscription
  const audioRef = useRef<AudioRef>({
    get currentTime() {
      return audioElementRef.current?.currentTime ?? 0;
    },
    get duration() {
      return audioElementRef.current?.duration ?? 0;
    },
    get paused() {
      return audioElementRef.current?.paused ?? true;
    },
    setCurrentTime: (time: number) => {
      if (audioElementRef.current) {
        audioElementRef.current.currentTime = time;
      }
    },
    play: async () => {
      if (audioElementRef.current) {
        await audioElementRef.current.play();
      }
    },
    pause: () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    },
    getAudioElement: () => audioElementRef.current,
  });

  // Handle continuous time updates during playback
  const handleTimeUpdate = useCallback(() => {
    if (audioElementRef.current) {
      setCurrentAudioTime(audioElementRef.current.currentTime);
    }
  }, []);

  // Handle user seeking in the audio timeline
  const handleSeeked = useCallback(() => {
    setShouldScrollToActive(true);
  }, []);

  return (
    <>
      <Box
        position="sticky"
        top="0"
        zIndex="1"
        background="white"
        pt="24px"
        pb="16px"
      >
        <audio
          ref={audioElementRef}
          title={title}
          controls
          style={{ width: '100%' }}
          onTimeUpdate={handleTimeUpdate}
          onSeeked={handleSeeked}
        >
          <source src={url} type={mimeType} />
        </audio>
      </Box>

      {isTranscriptionActive && file.relationships.transcript?.data && (
        <Box mt="16px">
          <FileTranscription
            file={file}
            audioRef={audioRef}
            currentAudioTime={currentAudioTime}
            shouldScrollToActive={shouldScrollToActive}
            onScrollComplete={() => setShouldScrollToActive(false)}
          />
        </Box>
      )}
    </>
  );
};

AudioFilePreview.displayName = 'AudioFilePreview';

export default AudioFilePreview;
