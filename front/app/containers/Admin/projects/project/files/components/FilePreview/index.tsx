import React from 'react';

import { Box, Label, Image, Text } from '@citizenlab/cl2-component-library';

import { IFile } from 'api/files/types';

import { useIntl } from 'utils/cl-intl';

import DownloadFileButton from '../DownloadFileButton';

import AudioFilePreview from './AudioFilePreview';
import CsvFilePreview from './CsvFilePreview';
import IframePreview from './IframeFilePreview';
import MarkdownFilePreview from './MarkdownFilePreview';
import messages from './messages';
import {
  AUDIO_MIMETYPES,
  CSV_MIMETYPES,
  IFRAME_MIMETYPES,
  IMAGE_MIMETYPES,
  MARKDOWN_MIMETYPES,
  VIDEO_MIMETYPES,
} from './utils';
import VideoFilePreview from './VideoFilePreview';

type Props = {
  file: IFile;
};

const FilePreview = ({ file }: Props) => {
  const { formatMessage } = useIntl();

  const getFilePreviewByType = () => {
    const mimeType = file.data.attributes.mime_type;
    const fileUrl = file.data.attributes.content.url;

    if (fileUrl) {
      if (IMAGE_MIMETYPES.has(mimeType)) {
        return (
          <Image
            src={fileUrl}
            alt={file.data.attributes.name}
            width="100%"
            height="auto"
          />
        );
      }

      if (VIDEO_MIMETYPES.has(mimeType)) {
        return (
          <VideoFilePreview url={fileUrl} title={file.data.attributes.name} />
        );
      }

      if (AUDIO_MIMETYPES.has(mimeType)) {
        return <AudioFilePreview url={fileUrl} mimeType={mimeType} />;
      }

      if (IFRAME_MIMETYPES.has(mimeType)) {
        return (
          <IframePreview
            url={fileUrl}
            title={file.data.attributes.name}
            height={700}
          />
        );
      }

      if (CSV_MIMETYPES.has(mimeType)) {
        return <CsvFilePreview file={file.data} />;
      }

      if (MARKDOWN_MIMETYPES.has(mimeType)) {
        return <MarkdownFilePreview file={file.data} />;
      }
    }

    return (
      <Box pt="4px">
        <Text fontSize="s" color="coolGrey600" fontStyle="italic">
          {formatMessage(messages.previewNotSupported)}
        </Text>
        <DownloadFileButton file={file.data} />
      </Box>
    );
  };

  // If we can't preview the file, we show a download button
  return (
    <Box>
      <Box>
        <Label>
          {formatMessage(messages.filePreviewLabel)}
          <DownloadFileButton file={file.data} variant="icon" />
        </Label>
      </Box>
      {getFilePreviewByType()}
    </Box>
  );
};

export default FilePreview;
