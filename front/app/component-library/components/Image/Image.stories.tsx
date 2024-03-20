import React from 'react';

import imageFile from './image.png';

import Image from '.';

const image = {
  src: imageFile,
  alt: 'Citizenlab logo',
};

export default {
  title: 'Components/Image',
  component: Image,
};

export const Default = {
  render: () => <Image src={image.src} alt={image.alt} />,
  name: 'default',
};
