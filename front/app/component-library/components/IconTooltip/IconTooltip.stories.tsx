import React from 'react';

import IconTooltip from '.';

export default {
  title: 'Components/IconTooltip',
  component: IconTooltip,
};

export const Default = {
  render: () => <IconTooltip content="Some text" />,
  name: 'default',
};

export const WithJsxElement = {
  render: () => <IconTooltip content={<div>A div with some text</div>} />,
  name: 'With JSX element',
};

export const FixedBottomPlacement = {
  render: () => <IconTooltip content="Some text" placement="bottom" />,
  name: 'Fixed bottom placement',
};

export const WithTransformTranslate = {
  render: () => (
    <IconTooltip
      content="Some text"
      placement="bottom"
      transform="translate(10,10)"
    />
  ),
  name: 'With transform: translate',
};
