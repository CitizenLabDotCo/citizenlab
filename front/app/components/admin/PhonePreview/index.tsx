import React, { ReactNode } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import PhonePreviewFrame from './PhonePreviewFrame';

interface Props {
  src: string;
  title: string;
  className?: string;
  dataCy?: string;
  // Starts the phone at the top of the area, to line up with content beside it. The area then
  // takes its height from the phone, so nothing is clipped and a hover ring can show at the top.
  alignTop?: boolean;
  children?: ReactNode;
}

const PhonePreview = ({
  src,
  title,
  className,
  dataCy,
  alignTop = false,
  children,
}: Props) => (
  <PhonePreviewFrame
    className={className}
    dataCy={dataCy}
    alignTop={alignTop}
    screen={
      <Box
        as="iframe"
        src={src}
        title={title}
        display="block"
        w="100%"
        h="100%"
        border="none"
      />
    }
  >
    {children}
  </PhonePreviewFrame>
);

export default PhonePreview;
