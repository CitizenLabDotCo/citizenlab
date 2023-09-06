import React, { memo } from 'react';

// components
import Comments from 'components/PostShowComponents/Comments';
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
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

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
  postType: 'idea' | 'initiative';
}

const Footer = memo<Props>(({ postId, postType, className }) => {
  const { data: appConfiguration } = useAppConfiguration();

  return (
    <Container className={className || ''}>
      <Content>
        <ContentInner>
          <Comments
            allowAnonymousParticipation={
              postType === 'initiative'
                ? appConfiguration?.data.attributes.settings.initiatives
                    ?.allow_anonymous_participation
                : undefined
            }
            postId={postId}
            postType={postType}
          />
        </ContentInner>
      </Content>
    </Container>
  );
});

export default Footer;
