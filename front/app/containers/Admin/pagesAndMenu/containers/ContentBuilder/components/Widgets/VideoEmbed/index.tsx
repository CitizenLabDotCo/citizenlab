import React from 'react';

import messages from './messages';

const markup = `

`;

interface Props {
  markup: string;
}

const VideoEmbed = ({ markup: _markup }: Props) => {
  return <div dangerouslySetInnerHTML={{ __html: markup }} />;
};

export const videoEmbedTitle = messages.videoEmbed;

export default VideoEmbed;
