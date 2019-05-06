import React, { memo, Suspense, lazy } from 'react';

// components
import LoadingComments from './Comments/LoadingComments';

// styling
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const maxPageWidth = '810px';

const Container = styled.div`
  flex: 1;
  width: 100%;
  margin-top: 70px;
  background: #f8f8f9;
  border-top: solid 1px #e2e2e2;

  ${media.smallerThanMinTablet`
    margin-top: 60px;
  `}
`;

const Content = styled.div`
  width: 100%;
  max-width: ${maxPageWidth};
  margin-left: auto;
  margin-right: auto;
  margin-top: 40px;
  padding-bottom: 60px;

  ${media.smallerThanMaxTablet`
    margin-top: 20px;
    padding-left: 30px;
    padding-right: 30px;
  `}

  ${media.smallerThanMinTablet`
    padding-left: 15px;
    padding-right: 15px;
    padding-top: 10px;
  `}
`;

interface Props {
  ideaId: string;
  className?: string;
}

const LazyComments = lazy(() => import('./Comments'));

const IdeaFooter = memo<Props>(({ ideaId, className }) => {
  return (
    <Container className={className}>
      <Content>
        <Suspense fallback={<LoadingComments />}>
          <LazyComments ideaId={ideaId} />
        </Suspense>
      </Content>
    </Container>
  );
});

export default IdeaFooter;
