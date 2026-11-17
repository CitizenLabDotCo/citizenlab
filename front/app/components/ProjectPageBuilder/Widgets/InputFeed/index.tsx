import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useEditor } from '@craftjs/core';

import { useParams } from 'utils/router';

import InputFeedContent from './InputFeedContent';

type Props = {
  colored: boolean;
};

const InputFeedSection = ({ colored }: Props) => {
  const { slug } = useParams({ strict: false }) as { slug?: string };
  const { enabled: inEditor } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  return (
    <Box
      id="e2e-project-page-input-feed"
      pointerEvents={slug ? 'auto' : 'none'}
      minHeight={inEditor ? '40px' : undefined}
    >
      <InputFeedContent colored={colored} />
    </Box>
  );
};

export default InputFeedSection;
