import React, { memo, useState } from 'react';
import { stringify } from 'qs';
import { omitBy, isNil } from 'lodash-es';
import styled from 'styled-components';
import Iframe from 'react-iframe';
import { defaultCardStyle } from 'utils/styleUtils';
import { Spinner } from 'cl2-component-library';

const surveyHeight = '500px';

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
  height: ${surveyHeight};
  display: flex;
  align-items: center;
  justify-content: center;
  ${defaultCardStyle};
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
          height={surveyHeight}
          display={isIframeLoaded ? 'block' : 'none'}
          overflow="hidden"
          onLoad={handleIframeOnLoad}
        />
      </Container>
    );
  }
);

export default TypeformSurvey;
