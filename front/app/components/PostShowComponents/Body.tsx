import React, { memo } from 'react';

import { useBreakpoint } from '@citizenlab/cl2-component-library';
import styled, { useTheme } from 'styled-components';

import Outlet from 'components/Outlet';
import QuillEditedContent from 'components/UI/QuillEditedContent';

const Container = styled.div``;

interface Props {
  postId: string;
  body: string;
  translateButtonClicked?: boolean;
  className?: string;
  color?: string;
}

const Body = memo<Props>(
  ({ postId, body, translateButtonClicked, className, color }) => {
    const smallerThanSmallTablet = useBreakpoint('tablet');
    const theme = useTheme();

    return (
      <Container id={`e2e-idea-description`} className={className}>
        <QuillEditedContent
          textColor={color || theme.colors.tenantText}
          fontSize={smallerThanSmallTablet ? 'base' : 'l'}
          fontWeight={400}
        >
          <div aria-live="polite">
            <Outlet
              id="app.components.PostShowComponents.Body.translation"
              postId={postId}
              body={body}
              translateButtonClicked={translateButtonClicked}
            >
              {(outletComponents) =>
                outletComponents.length > 0 ? (
                  <>{outletComponents}</>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: body }} />
                )
              }
            </Outlet>
          </div>
        </QuillEditedContent>
      </Container>
    );
  }
);

export default Body;
