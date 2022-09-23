import { useWindowSize } from '@citizenlab/cl2-component-library';
import React, { memo } from 'react';

// components
import QuillEditedContent from 'components/UI/QuillEditedContent';

// typings
import { Locale } from 'typings';

// styling
import Outlet from 'components/Outlet';
import styled, { useTheme } from 'styled-components';
import { viewportWidths } from 'utils/styleUtils';

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
    const theme: any = useTheme();
    const smallerThanSmallTablet = windowSize
      ? windowSize.windowWidth <= viewportWidths.smallTablet
      : false;

    return (
      <Container id={`e2e-${postType}-description`} className={className}>
        <QuillEditedContent
          textColor={color || theme.colorText}
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
