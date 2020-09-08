import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import useTranslation from 'hooks/useTranslation';
import useWindowSize from 'hooks/useWindowSize';

// components
import QuillEditedContent from 'components/UI/QuillEditedContent';

// typings
import { Locale } from 'typings';

// styling
import styled, { useTheme } from 'styled-components';
import { viewportWidths } from 'utils/styleUtils';

const Container = styled.div``;

interface Props {
  postId: string;
  body: string;
  locale?: Locale;
  translateButtonClicked?: boolean;
  className?: string;
  postType: 'idea' | 'initiative';
}

const Body = memo<Props>(
  ({ postId, body, locale, translateButtonClicked, className, postType }) => {
    const windowSize = useWindowSize();
    const theme: any = useTheme();
    const smallerThanSmallTablet = windowSize
      ? windowSize.windowWidth <= viewportWidths.smallTablet
      : false;

    if (locale) {
      const translation = useTranslation({
        attributeName: 'body_multiloc',
        localeTo: locale,
        id: postId,
        context: postType,
      });

      if (!isNilOrError(translation)) {
        const bodyText = translateButtonClicked
          ? translation.attributes.translation
          : body;

        return (
          <Container id={`e2e-${postType}-description`} className={className}>
            <QuillEditedContent
              textColor={theme.colorText}
              fontSize={smallerThanSmallTablet ? 'base' : 'large'}
              fontWeight={300}
            >
              <div aria-live="polite">
                <span dangerouslySetInnerHTML={{ __html: bodyText }} />
              </div>
            </QuillEditedContent>
          </Container>
        );
      }
    }

    return null;
  }
);

export default Body;
