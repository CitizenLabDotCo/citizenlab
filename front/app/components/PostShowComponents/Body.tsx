import React, { memo } from 'react';
import { useBreakpoint } from '@citizenlab/cl2-component-library';
import { isNilOrError } from 'utils/helperUtils';

// components
import QuillEditedContent from 'components/UI/QuillEditedContent';

// styling
import styled, { useTheme } from 'styled-components';
import Outlet from 'components/Outlet';
import useLocale from 'hooks/useLocale';

const Container = styled.div``;

interface Props {
  postId: string;
  body: string;
  translateButtonClicked?: boolean;
  className?: string;
  postType: 'idea' | 'initiative';
  color?: string;
}

const Body = memo<Props>(
  ({ postId, body, translateButtonClicked, className, postType, color }) => {
    const locale = useLocale();
    const smallerThanSmallTablet = useBreakpoint('tablet');
    const theme = useTheme();

    if (isNilOrError(locale)) {
      return null;
    }

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
