import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

interface Props {
  id?: string;
  className?: string;
}

/**
 * ScrollTrigger component that acts as an invisible marker at the bottom of content.
 * Used by IntersectionObserver to detect when user has scrolled to the bottom.
 * This component should be placed at the very end of the survey content.
 */
const ScrollTrigger: React.FC<Props> = ({
  id = 'bottom-trigger',
  className,
}) => {
  return (
    <Box
      id={id}
      className={className}
      height="1px"
      width="100%"
      // Make it invisible but still detectable by IntersectionObserver
      style={{
        visibility: 'hidden',
        pointerEvents: 'none',
        position: 'relative',
        zIndex: -1,
      }}
      aria-hidden="true"
    />
  );
};

export default ScrollTrigger;
