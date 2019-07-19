import React, { memo, Suspense, lazy } from 'react';

// components
import LoadingComments from './Comments/LoadingComments';

// styling
import styled from 'styled-components';
import { media, postPageContentMaxWidth } from 'utils/styleUtils';
import { columnsGapDesktop, rightColumnWidthDesktop, columnsGapTablet, rightColumnWidthTablet } from './styleConstants';

const Container = styled.div`
  flex: 1;
  width: 100%;
  margin-top: 80px;
  background: #f8f8f9;
  border-top: solid 1px #e2e2e2;

  ${media.smallerThanMinTablet`
    margin-top: 60px;
  `}
`;

const Content = styled.div`
  width: 100%;
  max-width: ${postPageContentMaxWidth};
  margin-left: auto;
  margin-right: auto;
  margin-top: 70px;
  padding-left: 60px;
  padding-right: 60px;
  padding-bottom: 60px;

  ${media.smallerThanMaxTablet`
    margin-top: 60px;
  `}

  ${media.smallerThanMinTablet`
    padding-left: 15px;
    padding-right: 15px;
    padding-top: 10px;
  `}
`;

const ContentInner = styled.div`
  padding-right: ${rightColumnWidthDesktop + columnsGapDesktop}px;

  ${media.tablet`
    padding-right: ${rightColumnWidthTablet + columnsGapTablet}px;
  `}

  ${media.smallerThanMaxTablet`
    padding-right: 0px;
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
        <ContentInner>
          <Suspense fallback={<LoadingComments />}>
            <LazyComments ideaId={ideaId} />
          </Suspense>
        </ContentInner>
      </Content>
    </Container>
  );
});

export default IdeaFooter;
