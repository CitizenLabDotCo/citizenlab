import React, { memo } from 'react';
import { useWindowSize } from '@citizenlab/cl2-component-library';

// components
import QuillEditedContent from 'components/UI/QuillEditedContent';

// typings

// styling
import styled, { useTheme } from 'styled-components';
import { viewportWidths } from 'utils/styleUtils';

const Container = styled.div``;

interface Props {
  className?: string;
  postType: 'idea' | 'initiative';
  color?: string;
  body: string;
}

const Body = memo<Props>(({ className, postType, color, body }) => {
  const windowSize = useWindowSize();
  const theme = useTheme();
  const smallerThanSmallTablet = windowSize
    ? windowSize.windowWidth <= viewportWidths.tablet
    : false;

  return (
    <Container id={`e2e-${postType}-description`} className={className}>
      <QuillEditedContent
        textColor={color || theme.colors.tenantText}
        fontSize={smallerThanSmallTablet ? 'base' : 'l'}
        fontWeight={400}
      >
        <div aria-live="polite">
          <div dangerouslySetInnerHTML={{ __html: body }} />
        </div>
      </QuillEditedContent>
    </Container>
  );
});

export default Body;
