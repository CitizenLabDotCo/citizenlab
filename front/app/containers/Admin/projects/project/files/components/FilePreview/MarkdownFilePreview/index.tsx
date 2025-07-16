import React, { useEffect, useState } from 'react';

import { Spinner, Box, Text, Divider } from '@citizenlab/cl2-component-library';
import ReactMarkdown from 'react-markdown';

import { IFileData } from 'api/files/types';

import { useIntl } from 'utils/cl-intl';

import DownloadFileButton from '../../DownloadFileButton';
import messages from '../messages';

type Props = {
  file: IFileData;
};

const MarkdownFilePreview = ({ file }: Props) => {
  const url = file.attributes.content.url;

  const { formatMessage } = useIntl();
  const [markdown, setMarkdown] = useState<string | undefined>(undefined);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(url) // Fetch markdown file content
      .then((result) => {
        if (result.ok) {
          return result.text();
        }
        setError(true);
        return;
      })
      .then(setMarkdown)
      .catch(() => setError(true));
  }, [url]);

  if (error) {
    return (
      <Box>
        <Text color="error">
          {formatMessage(messages.couldNotLoadMarkdown)}
        </Text>
        <DownloadFileButton file={file} />
      </Box>
    );
  }

  if (!markdown) {
    return <Spinner />;
  }

  return (
    <Box mt="24px">
      <Divider />
      <Box mt="28px">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </Box>
    </Box>
  );
};

export default MarkdownFilePreview;
