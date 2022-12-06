import React, { memo } from 'react';
// styling
import styled, { useTheme } from 'styled-components';
// typings
import { Locale } from 'typings';
import { useWindowSize } from '@citizenlab/cl2-component-library';
import { viewportWidths } from 'utils/styleUtils';
import Outlet from 'components/Outlet';
// components
import QuillEditedContent from 'components/UI/QuillEditedContent';

const Container = styled.div``;

interface Props {
  postId: string;
  body: string;
  locale: Locale;
  translateButtonClicked?: boolean;
  className?: string;
  postType: 'idea' | 'initiative';
  color?: string;
}

const Body = memo<Props>(
  ({
    postId,
    body,
    locale,
    translateButtonClicked,
    className,
    postType,
    color,
  }) => {
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
            <Outlet
              id="app.components.PostShowComponents.Body.translation"
              postId={postId}
              locale={locale}
              postType={postType}
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
