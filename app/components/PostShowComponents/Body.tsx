import React, { memo, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import useTranslation from 'hooks/useTranslation';
import useWindowSize from 'hooks/useWindowSize';

// components
import QuillEditedContent from 'components/UI/QuillEditedContent';
import Button from 'components/UI/Button';

// typings
import { Locale } from 'typings';

// styling
import styled, { useTheme } from 'styled-components';
import { viewportWidths } from 'utils/styleUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const Container = styled.div``;

const LoadMoreTextButton = styled(Button)`
  text-decoration: underline;
  display: inline-block;
`;

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
    const [loadMoreButtonClicked, setLoadMoreButtonClicked] = useState(false);
    const windowSize = useWindowSize();
    const theme: any = useTheme();
    const smallerThanSmallTablet = windowSize
      ? windowSize.windowWidth <= viewportWidths.smallTablet
      : false;

    const loadMore = () => {
      setLoadMoreButtonClicked(true);
    };

    if (locale) {
      const translation = useTranslation({
        attributeName: 'body_multiloc',
        localeTo: locale,
        id: postId,
        context: postType,
      });

      if (!isNilOrError(translation)) {
        const originalBodyText = translateButtonClicked
          ? translation.attributes.translation
          : body;
        const wordsArray = originalBodyText.split(' ');
        const numberOfWords = wordsArray.length;
        const initialWordsLimitToDisplay = 50;
        const hasTooLongBody = numberOfWords > initialWordsLimitToDisplay;
        const showLoadMoreButton = hasTooLongBody && !loadMoreButtonClicked;
        const bodyTextToDisplay = showLoadMoreButton
          ? wordsArray
              .slice(0, initialWordsLimitToDisplay)
              .join(' ')
              .concat('...')
          : originalBodyText;

        // TODO: copy
        // TODO: a11y
        // TODO: styling

        return (
          <Container id={`e2e-${postType}-description`} className={className}>
            <QuillEditedContent
              textColor={theme.colorText}
              fontSize={smallerThanSmallTablet ? 'base' : 'large'}
              fontWeight={300}
            >
              <div aria-live="polite">
                <span dangerouslySetInnerHTML={{ __html: bodyTextToDisplay }} />
              </div>
            </QuillEditedContent>
            {showLoadMoreButton && (
              <LoadMoreTextButton buttonStyle="text" onClick={loadMore}>
                <FormattedMessage {...messages.loadMore} />
              </LoadMoreTextButton>
            )}
          </Container>
        );
      }
    }

    return null;
  }
);

export default Body;
