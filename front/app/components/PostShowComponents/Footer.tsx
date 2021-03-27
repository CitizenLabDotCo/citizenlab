import React, { memo, Suspense, lazy } from 'react';

// components
import LoadingComments from './Comments/LoadingComments';
const LazyComments = lazy(() => import('./Comments'));

// styling
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import {
  columnsGapDesktop,
  rightColumnWidthDesktop,
  columnsGapTablet,
  rightColumnWidthTablet,
  postPageContentMaxWidth,
} from './styleConstants';

const Container = styled.div`
  flex: 1 1 auto;
  width: 100%;
`;

const Content = styled.div`
  width: 100%;
  max-width: ${postPageContentMaxWidth}px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 50px;
  padding-left: 60px;
  padding-right: 60px;
  padding-bottom: 80px;

  ${media.smallerThanMinTablet`
    margin-top: 30px;
    padding-left: 15px;
    padding-right: 15px;
    padding-bottom: 30px;
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

const Footer = memo<Props>(({ postId, postType, className }) => {
  return (
    <Container className={className || ''}>
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
