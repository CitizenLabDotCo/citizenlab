import React from 'react';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';
import { getSubtextElement } from 'components/Form/Components/Controls/controlUtils';

// styling
import { colors } from 'utils/styleUtils';

// typings
import { Element } from '../typings';

interface Props {
  element: Element;
  lines: number;
}

const Text = ({ element, lines }: Props) => {
  return (
    <>
      <Title variant="h3" as="h2">
        {element.label}
      </Title>
      {element.options.description !== '' &&
        getSubtextElement(element.options.description)}
      {Array(lines)
        .fill(0)
        .map((_, i) => (
          <Box
            key={i}
            mt="40px"
            borderBottom={`solid 1px ${colors.grey200}`}
            w="170mm"
          />
        ))}
    </>
  );
};

export default Text;
