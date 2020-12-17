import React, { memo /*, useState */ } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import useTranslation from 'hooks/useTranslation';
import useWindowSize from 'hooks/useWindowSize';

// components
import QuillEditedContent from 'components/UI/QuillEditedContent';
// import Button from 'components/UI/Button';

// typings
import { Locale } from 'typings';

// styling
import styled, { useTheme } from 'styled-components';
import { viewportWidths } from 'utils/styleUtils';

// // i18n
// import { FormattedMessage } from 'utils/cl-intl';
// import messages from './messages';

const Container = styled.div``;

// const ReadMoreTextButton = styled(Button)`
//   text-decoration: underline;
//   display: inline-block;
// `;

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
    // const [readMoreButtonClicked, setReadMoreButtonClicked] = useState(false);
    const windowSize = useWindowSize();
    const theme: any = useTheme();
    const smallerThanSmallTablet = windowSize
      ? windowSize.windowWidth <= viewportWidths.smallTablet
      : false;
    const translation = useTranslation({
      attributeName: 'body_multiloc',
      localeTo: locale,
      id: postId,
      context: postType,
    });
    // const initialWordsLimitToDisplay = 50;

    // const readMore = () => {
    //   setReadMoreButtonClicked(true);
    // };

    const getBodyText = (bodyText: string) => {
      if (translateButtonClicked && !isNilOrError(translation)) {
        return translation.attributes.translation;
      }

      return bodyText;
    };

    // const hasReadMore = (bodyText: string) => {
    //   const wordsArray = bodyText.split(' ');
    //   const numberOfWords = wordsArray.length;
    //   const hasTooLongBody = numberOfWords > initialWordsLimitToDisplay;
    //   return hasTooLongBody && !readMoreButtonClicked;
    // };

    const bodyText = getBodyText(body);
    // const bodyTextHasLoadMore = hasReadMore(bodyText);
    // const showReadMoreButton = bodyTextHasReadMore && !readMoreButtonClicked;

    // const bodyTextToDisplay = bodyTextHasLoadMore
    //   ? bodyText
    //       .split(' ')
    //       .slice(0, initialWordsLimitToDisplay)
    //       .join(' ')
    //       .concat('...')
    //   : bodyText;

    return (
      <Container id={`e2e-${postType}-description`} className={className}>
        <QuillEditedContent
          textColor={color || theme.colorText}
          fontSize={smallerThanSmallTablet ? 'base' : 'large'}
          fontWeight={400}
        >
          <div aria-live="polite">
            <span dangerouslySetInnerHTML={{ __html: bodyText }} />
          </div>
        </QuillEditedContent>
        {/* {showLoadMoreButton && (
          <LoadMoreTextButton buttonStyle="text" onClick={loadMore}>
            <FormattedMessage {...messages.readMore} />
          </LoadMoreTextButton>
        )} */}
      </Container>
    );
  }
);

export default Body;
