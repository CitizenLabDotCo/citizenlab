import React, { memo, useState } from 'react';

// styling
import { defaultCardStyle, viewportWidths, media } from 'utils/styleUtils';
import styled from 'styled-components';

// components
import { Spinner } from 'cl2-component-library';
import Iframe from 'react-iframe';

// hooks
import useWindowSize from 'hooks/useWindowSize';

const surveyHeightDesktop = '600px';
const surveyHeightMobile = '500px';

const Container = styled.div`
  display: flex;
  flex-direction: column;

  iframe {
    border: solid 1px #ccc;
    border-radius: ${(props: any) => props.theme.borderRadius};
  }
`;

const Placeholder = styled.div`
  width: 100%;
  height: ${surveyHeightDesktop};
  display: flex;
  align-items: center;
  justify-content: center;
  ${defaultCardStyle};

  ${media.smallerThanMaxTablet`
    height: ${surveyHeightMobile};
  `}
`;

type Props = {
  surveyXactUrl: string;
  className?: string;
};

export default memo<Props>(({ surveyXactUrl, className }) => {
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const windowSize = useWindowSize();
  const smallerThanLargeTablet = windowSize
    ? windowSize.windowWidth <= viewportWidths.largeTablet
    : false;
  const handleIframeOnLoad = () => {
    setIsIframeLoaded(true);
  };

  return (
    <Container className={className || ''}>
      {!isIframeLoaded && (
        <Placeholder>
          <Spinner />
        </Placeholder>
      )}
      <Iframe
        url={surveyXactUrl}
        width="100%"
        height={
          smallerThanLargeTablet ? surveyHeightMobile : surveyHeightDesktop
        }
        display={isIframeLoaded ? 'block' : 'none'}
        overflow="hidden"
        onLoad={handleIframeOnLoad}
      />
    </Container>
  );
});
