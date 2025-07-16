import React from 'react';

import { Box, Label, Text } from '@citizenlab/cl2-component-library';

import { IFile } from 'api/files/types';

import { useIntl } from 'utils/cl-intl';

import DownloadFileButton from '../DownloadFileButton';

import CsvFilePreview from './CsvFilePreview';
import IframePreview from './IframeFilePreview';
import ImageFilePreview from './ImageFilePreview';
import MarkdownFilePreview from './MarkdownFilePreview';
import messages from './messages';
import VideoFilePreview from './VideoFilePreview';

type Props = {
  file: IFile;
};

const FilePreview = ({ file }: Props) => {
  const { formatMessage } = useIntl();

  const getFilePreviewByType = () => {
    const mimeType = file.data.attributes.mime_type;
    const fileUrl = file.data.attributes.content.url;

    switch (mimeType) {
      // Images
      case 'image/jpeg':
      case 'image/png':
      case 'image/gif':
      case 'image/webp':
      case 'image/tiff':
      case 'image/svg+xml':
      case 'image/x-icon':
      case 'image/vnd.microsoft.icon':
      case 'image/bmp':
        return <ImageFilePreview url={fileUrl} />;

      // Video
      case 'video/mp4':
      case 'video/webm':
      case 'video/ogg':
      case 'video/avi':
      case 'video/mpeg':
      case 'video/quicktime':
      case 'video/x-msvideo':
      case 'video/x-m4v':
        return <VideoFilePreview url={fileUrl} />;

      // Audio
      case 'audio/mpeg':
      case 'audio/mp3':
      case 'audio/wav':
      case 'audio/ogg':
      case 'audio/webm':
      case 'audio/x-mpeg':
      case 'audio/x-wav':
        return (
          <Box mt="24px">
            <audio controls style={{ width: '100%' }}>
              <source src={fileUrl} type={mimeType} />
              {formatMessage(messages.previewNotSupported)}
            </audio>
          </Box>
        );

      // PDF
      case 'application/pdf':
        return <IframePreview url={fileUrl} title="PDF preview" height={700} />;

      // Plain text & simple code formats
      case 'text/plain':
      case 'text/javascript':
      case 'application/json':
      case 'application/xml':
      case 'text/xml':
      case 'application/x-yaml':
      case 'text/x-yaml':
        return (
          <IframePreview url={fileUrl} title="Text preview" height={700} />
        );

      // HTML
      case 'text/html':
        return (
          <IframePreview url={fileUrl} title="HTML preview" height={700} />
        );

      // CSV
      case 'text/csv':
      case 'application/csv':
      case 'text/comma-separated-values':
        return <CsvFilePreview file={file.data} />;

      // Markdown
      case 'text/markdown':
        return <MarkdownFilePreview file={file.data} />;

      // EPUB
      case 'application/epub+zip':
        return (
          <IframePreview url={fileUrl} title="EPUB preview" height={700} />
        );

      // Default fallback: Download button
      default:
        return (
          <Box pt="4px">
            <Text fontSize="s" color="coolGrey600" fontStyle="italic">
              {formatMessage(messages.previewNotSupported)}
            </Text>
            <DownloadFileButton file={file.data} />
          </Box>
        );
    }
  };

  return (
    <Box>
      <Box>
        <Label>{formatMessage(messages.filePreviewLabel)}</Label>
      </Box>
      {getFilePreviewByType()}
    </Box>
  );
};

export default FilePreview;
