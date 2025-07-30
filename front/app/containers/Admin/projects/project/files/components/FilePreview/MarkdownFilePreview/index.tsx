import React, { useEffect, useState } from 'react';

import { Spinner, Box, Text } from '@citizenlab/cl2-component-library';
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
    // AbortController to cancel fetch if component unmounts
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchMarkdown = async () => {
      try {
        const response = await fetch(url, { signal });
        if (!response.ok) {
          throw new Error('Failed to fetch markdown file');
        }
        const text = await response.text();
        setMarkdown(text);
      } catch (err) {
        // Don't set error state if the request was aborted
        if (err.name !== 'AbortError') {
          setError(true);
        }
      }
    };

    fetchMarkdown();

    // Set up timeout to abort after 5 seconds
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 5000);

    // Cleanup function
    return () => {
      controller.abort(); // Cancel the fetch
      clearTimeout(timeoutId); // Cancel the timeout
    };
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
      <Box mt="28px">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </Box>
    </Box>
  );
};

export default MarkdownFilePreview;
