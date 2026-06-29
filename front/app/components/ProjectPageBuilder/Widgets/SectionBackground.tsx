import { Box, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

// Grey section background for the timeline + participation content, mirroring the
// old project page's grey timeline/content section.
//
// On the public project page the widgets render inside a width-constrained
// content-builder frame, so `$fullBleed` breaks the band out to the full viewport
// width with negative side margins. In the builder the canvas is itself narrow
// and not viewport-width, so the viewport-based margins would push content
// off-canvas — there we leave it at the normal full container width instead.
const SectionBackground = styled(Box)<{ $fullBleed?: boolean }>`
  background: ${colors.background};
  ${({ $fullBleed }) =>
    $fullBleed
      ? `
    margin-left: calc(-50vw + 50%);
    margin-right: calc(-50vw + 50%);
  `
      : ''}
`;

export default SectionBackground;
