import React from 'react';

import { useParams } from 'utils/router';

import FullScreenPreview from './FullScreenPreview';

const CustomPageFullScreenPreview = () => {
  const { customPageId } = useParams({ strict: false }) as {
    customPageId: string;
  };

  return <FullScreenPreview staticPageId={customPageId} />;
};

export default CustomPageFullScreenPreview;
