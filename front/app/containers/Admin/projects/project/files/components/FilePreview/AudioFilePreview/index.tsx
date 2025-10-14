import React, {
  useRef,
  useImperativeHandle,
  useCallback,
  forwardRef,
} from 'react';

import { Box } from '@citizenlab/cl2-component-library';

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
  onCurrentTimeUpdate?: (time: number) => void;
};

const AudioFilePreview = forwardRef<AudioRef, Props>(
  ({ url, title, mimeType, onCurrentTimeUpdate }, ref) => {
    const audioElementRef = useRef<HTMLAudioElement>(null);
    const isProgrammaticSeekRef = useRef(false);

    // Expose audio controls to parent component via ref
    useImperativeHandle(
      ref,
      () => ({
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
            isProgrammaticSeekRef.current = true;
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
      }),
      []
    );

    // Handle continuous time updates during playback
    const handleTimeUpdate = useCallback(() => {
      if (audioElementRef.current && onCurrentTimeUpdate) {
        onCurrentTimeUpdate(audioElementRef.current.currentTime);
      }
    }, [onCurrentTimeUpdate]);

    return (
      <Box mt="24px">
        <audio
          ref={audioElementRef}
          title={title}
          controls
          style={{ width: '100%' }}
          onTimeUpdate={handleTimeUpdate}
        >
          <source src={url} type={mimeType} />
        </audio>
      </Box>
    );
  }
);

AudioFilePreview.displayName = 'AudioFilePreview';

export default AudioFilePreview;
