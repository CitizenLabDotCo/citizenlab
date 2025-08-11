import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useFileTranscript from 'api/file_transcript/useFileTranscript';
import { IFileData } from 'api/files/types';

import { AUDIO_MIMETYPES, VIDEO_MIMETYPES } from '../../FilePreview/utils';

type Props = {
  file: IFileData;
};
const FileTranscription = ({ file }: Props) => {
  const { data: fileTranscript } = useFileTranscript(file.id);

  const mimeType = file.attributes.mime_type;

  if (VIDEO_MIMETYPES.has(mimeType) || AUDIO_MIMETYPES.has(mimeType)) {
    console.log({ fileTranscript });

    return <Box p="24px">TODO: Simple File Transcription UI</Box>;
  }

  return null;
};

export default FileTranscription;
