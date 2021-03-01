import React, { memo, useState } from 'react';
import { stringify } from 'qs';
import { omitBy, isNil } from 'lodash-es';

// components
import { Spinner } from 'cl2-component-library';
import Iframe from 'react-iframe';

// hooks
import useWindowSize from 'hooks/useWindowSize';

// styling
import styled from 'styled-components';
import { defaultCardStyle, viewportWidths, media } from 'utils/styleUtils';

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

interface Props {
  typeformUrl: string;
  email: string | null;
  user_id: string | null;
  className?: string;
}

const TypeformSurvey = memo<Props>(
  ({ typeformUrl, email, user_id, className }) => {
    const [isIframeLoaded, setIsIframeLoaded] = useState(false);
    const windowSize = useWindowSize();
    const smallerThanLargeTablet = windowSize
      ? windowSize.windowWidth <= viewportWidths.largeTablet
      : false;

    const queryString = stringify(omitBy({ email, user_id }, isNil));
    const surveyUrl = `${typeformUrl}?${queryString}`;

    const handleIframeOnLoad = () => {
      setTimeout(() => {
        setIsIframeLoaded(true);
      }, 1000);
    };

    return (
      <Container className={className || ''}>
        {!isIframeLoaded && (
          <Placeholder>
            <Spinner />
          </Placeholder>
        )}
        <Iframe
          url={surveyUrl}
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
  }
);

export default TypeformSurvey;
