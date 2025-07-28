import React from 'react';

type Props = {
  url: string;
  title: string;
  height?: number;
};

const IframePreview = ({ url, title, height = 500 }: Props) => (
  <iframe
    src={url}
    title={title}
    style={{
      width: '100%',
      height: `${height}px`,
      border: 'none',
    }}
  />
);

export default IframePreview;
