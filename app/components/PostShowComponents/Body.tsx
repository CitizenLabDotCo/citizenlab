import React, { memo /*, useState */ } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import useTranslation from 'modules/machine_translations/hooks/useTranslation';
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

    const getBodyText = (bodyText: string) => {
      if (translateButtonClicked && !isNilOrError(translation)) {
        return translation.attributes.translation;
      }

      return bodyText;
    };

    const bodyText = getBodyText(body);

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
      </Container>
    );
  }
);

export default Body;
