import React, { memo } from 'react';

import { media } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import CommentsSection from 'components/PostShowComponents/Comments/CommentsSection';

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
  padding-left: 60px;
  padding-right: 60px;
  padding-bottom: 80px;

  ${media.phone`
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

  ${media.tablet`
    padding-right: 0px;
  `}
`;

interface Props {
  className?: string;
  postId: string;
}

const Footer = memo<Props>(({ postId, className }) => {
  return (
    <Container className={className || ''}>
      <Content>
        <ContentInner>
          <CommentsSection postId={postId} />
        </ContentInner>
      </Content>
    </Container>
  );
});

export default Footer;
