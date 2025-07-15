import React, { useEffect, useState } from 'react';

import { Spinner, Box, Text, Divider } from '@citizenlab/cl2-component-library';
import ReactMarkdown from 'react-markdown';

type Props = {
  url: string;
};

const MarkdownFilePreview = ({ url }: Props) => {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Fetch failed');
        return res.text();
      })
      .then(setMarkdown)
      .catch(() => setError(true));
  }, [url]);

  if (error) {
    return <Text color="error">Could not load markdown file.</Text>;
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
