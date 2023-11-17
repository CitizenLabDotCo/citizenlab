import React from 'react';
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { A4_WIDTH } from 'containers/Admin/reporting/constants';
import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';
import { media } from 'utils/styleUtils';

export interface StoryProps {
  backgrounds: boolean;
}

export interface Props extends StoryProps {
  showPadding?: boolean;
}

const b = `1px dotted black`;

const WidgetDesignSystem = (props: StoryProps) => {
  const smallerThanTablet = useBreakpoint('tablet');

  return (
    <Box maxWidth={A4_WIDTH} width="100%" borderLeft={b} borderRight={b}>
      <FullWidthThing {...props} showPadding={smallerThanTablet} />
      <GraphCard {...props} showPadding={smallerThanTablet} />

      <TwoColumns
        {...props}
        showPadding={smallerThanTablet}
        left={<FullWidthThing {...props} />}
        // right={<GraphCard {...props} />}
        right={<FullWidthThing {...props} />}
      />
    </Box>
  );
};

const _if = <T,>(bool: boolean | undefined, value: T) => {
  if (bool) return value;
  return undefined;
};

const FullWidthThing = ({ backgrounds, showPadding }: Props) => (
  <Box
    w="100%"
    h="200px"
    bgColor={_if(backgrounds, 'red')}
    p={_if(showPadding, DEFAULT_PADDING)}
  >
    <Box w="100%" h="100%" bgColor={_if(backgrounds, 'yellow')}>
      Some text
    </Box>
  </Box>
);

const GraphCard = ({ backgrounds, showPadding }: Props) => (
  <Box
    w="100%"
    h="200px"
    p={_if(showPadding, '10px')}
    bgColor={_if(backgrounds, 'red')}
  >
    <Box
      w="100%"
      h="100%"
      p="9px"
      border={`1px solid gray`}
      bgColor={_if(backgrounds, 'green')}
    >
      <Box w="100%" h="100%" bgColor={_if(backgrounds, 'yellow')}>
        Card insides
      </Box>
    </Box>
  </Box>
);

interface TwoColumnsProps extends Props {
  left?: JSX.Element;
  right?: JSX.Element;
}

const TwoColumnWrapper = styled.div<{ bgColor?: string; px?: string }>`
  ${({ bgColor }) => (bgColor ? `background-color: ${bgColor};` : '')}
  ${({ px }) => (px ? `padding-left: ${px}; padding-right: ${px};` : '')}
  min-height: 200px;
  width: 100%;
  gap: 24px;
  display: grid;

  ${media.tablet`
    grid-template-columns: 1fr;
    gap: 0px;
`}

  grid-template-columns: 1fr 1fr;
`;

const TwoColumns = ({
  backgrounds,
  left,
  right,
  showPadding,
}: TwoColumnsProps) => (
  <TwoColumnWrapper
    bgColor={_if(backgrounds, 'red')}
    px={_if(showPadding, DEFAULT_PADDING)}
  >
    <Box>{left}</Box>
    <Box>{right}</Box>
  </TwoColumnWrapper>
);

export default WidgetDesignSystem;
