import React, { memo } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import QuillEditedContent from 'components/UI/QuillEditedContent';

// resources
import GetMachineTranslation from 'resources/GetMachineTranslation';
import GetWindowSize, {
  GetWindowSizeChildProps,
} from 'resources/GetWindowSize';

// typings
import { Locale } from 'typings';

// styling
import styled, { withTheme } from 'styled-components';
import { viewportWidths } from 'utils/styleUtils';

const Container = styled.div``;

interface InputProps {
  postId: string;
  body: string;
  locale?: Locale;
  translateButtonClicked?: boolean;
  className?: string;
  postType: 'idea' | 'initiative';
}

interface DataProps {
  windowSize: GetWindowSizeChildProps;
}

interface Props extends InputProps, DataProps {
  theme: any;
}

const Body = memo<Props>(
  ({
    postId,
    body,
    locale,
    translateButtonClicked,
    theme,
    windowSize,
    className,
    postType,
  }) => {
    const smallerThanSmallTablet = windowSize
      ? windowSize <= viewportWidths.smallTablet
      : false;

    return (
      <Container id={`e2e-${postType}-description`} className={className}>
        <QuillEditedContent
          textColor={theme.colorText}
          fontSize={smallerThanSmallTablet ? 'base' : 'large'}
        >
          <div aria-live="polite">
            {translateButtonClicked && locale ? (
              <GetMachineTranslation
                attributeName="body_multiloc"
                localeTo={locale}
                id={postId}
                context={postType}
              >
                {(translation) => {
                  if (!isNilOrError(translation)) {
                    return (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: translation.attributes.translation,
                        }}
                      />
                    );
                  }

                  return <span dangerouslySetInnerHTML={{ __html: body }} />;
                }}
              </GetMachineTranslation>
            ) : (
              <span dangerouslySetInnerHTML={{ __html: body }} />
            )}
          </div>
        </QuillEditedContent>
      </Container>
    );
  }
);

const BodyWithHOCs = withTheme(Body);

const Data = adopt<DataProps, InputProps>({
  windowSize: <GetWindowSize />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <BodyWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
