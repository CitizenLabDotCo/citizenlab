import React from 'react';
import { render, screen } from '../../utils/testUtils/rtl';
import LateralScrollControls from '.';
import Box from '../Box';

describe('<LateralScrollControls />', () => {
  it('renders', () => {
    const containerRef = React.createRef<HTMLDivElement>();

    render(
      <LateralScrollControls containerRef={containerRef}>
        <Box
          display="flex"
          width="200px"
          height="auto"
          gap="16px"
          flexDirection="row"
          flexWrap="nowrap"
          overflow="auto"
          overflowX="scroll"
          py="24px"
          ref={containerRef}
        >
          <Box width="200px">Element 1</Box>
          <Box width="200px">Element 2</Box>
          <Box width="200px">Element 3</Box>
          <Box width="200px">Element 4</Box>
          <Box width="200px">Element 5</Box>
        </Box>
      </LateralScrollControls>
    );

    expect(
      screen.getByTestId('event-previews-scroll-left')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('event-previews-scroll-right')
    ).toBeInTheDocument();
  });
});
