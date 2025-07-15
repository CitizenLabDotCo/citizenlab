import React, { useEffect, useState } from 'react';

import { Spinner, Box, Text, Divider } from '@citizenlab/cl2-component-library';
import ReactMarkdown from 'react-markdown';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

type Props = {
  url: string;
};

const MarkdownFilePreview = ({ url }: Props) => {
  const { formatMessage } = useIntl();
  const [markdown, setMarkdown] = useState<string | undefined>(undefined);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(url) // Fetch markdown file content
      .then((result) => {
        if (result.ok) {
          return result.text();
        }
        return;
      })
      .then(setMarkdown)
      .catch(() => setError(true));
  }, [url]);

  if (error) {
    return (
      <Text color="error">{formatMessage(messages.couldNotLoadMarkdown)}</Text>
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
