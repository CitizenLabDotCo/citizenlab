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
  margin-top: 60px;
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
  margin-top: 50px;
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
  className?: string;
  postId: string;
  postType: 'idea' | 'initiative';
}

const LazyComments = lazy(() => import('./Comments'));

const Footer = memo<Props>(({ postId, postType, className }) => {
  return (
    <Container className={className}>
      <Content>
        <ContentInner>
          <Suspense fallback={<LoadingComments />}>
            <LazyComments postId={postId} postType={postType} />
          </Suspense>
        </ContentInner>
      </Content>
    </Container>
  );
});

export default Footer;
