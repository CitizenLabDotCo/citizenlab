import React from 'react';

type Props = {
  url: string;
  title: string;
  height?: number;
  sandbox?: string;
};

const IframePreview = ({ url, title, height = 500, sandbox }: Props) => (
  <iframe
    src={url}
    title={title}
    sandbox={sandbox}
    style={{
      width: '100%',
      height: `${height}px`,
      border: 'none',
    }}
  />
);

export default IframePreview;
