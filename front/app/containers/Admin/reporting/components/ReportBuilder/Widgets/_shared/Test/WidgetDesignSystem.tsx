import React from 'react';
import { Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { A4_WIDTH } from 'containers/Admin/reporting/constants';
import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';
import { media } from 'utils/styleUtils';

export interface Props {
  backgrounds: boolean;
}

const WidgetDesignSystem = (props: Props) => {
  return (
    <Box maxWidth={A4_WIDTH} width="100%">
      <FullWidthThing {...props} />
      <GraphCard {...props} />

      <TwoColumns
        {...props}
        left={<FullWidthThing {...props} />}
        right={<GraphCard {...props} />}
      />
    </Box>
  );
};

const _if = <T,>(bool: boolean, value: T) => {
  if (bool) return value;
  return undefined;
};

const FullWidthThing = ({ backgrounds }: Props) => (
  <Box w="100%" h="200px" bgColor={_if(backgrounds, 'red')} p={DEFAULT_PADDING}>
    <Box w="100%" h="100%" bgColor={_if(backgrounds, 'yellow')}>
      Some text
    </Box>
  </Box>
);

const GraphCard = ({ backgrounds }: Props) => (
  <Box w="100%" h="200px" p="10px" bgColor={_if(backgrounds, 'red')}>
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
  left: JSX.Element;
  right: JSX.Element;
}

const TwoColumnWrapper = styled.div<{ bgColor?: string }>`
  ${({ bgColor }) => (bgColor ? `background-color: ${bgColor};` : '')}
  height: 200px;
  width: 100%;
  gap: 24px;
  display: grid;

  ${media.tablet`
  grid-template-columns: 1fr;
`}

  grid-template-columns: 1fr 1fr;
`;

const TwoColumns = ({ backgrounds, left, right }: TwoColumnsProps) => (
  <TwoColumnWrapper bgColor={_if(backgrounds, 'yellow')}>
    <Box>{left}</Box>
    <Box>{right}</Box>
  </TwoColumnWrapper>
);

export default WidgetDesignSystem;
