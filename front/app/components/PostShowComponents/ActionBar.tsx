import React, { memo } from 'react';

// styles
import styled from 'styled-components';
import { colors, media } from 'utils/styleUtils';
import { postPageContentMaxWidth } from './styleConstants';

const Container = styled.div`
  width: 100%;
  height: 50px;
  color: ${colors.textSecondary};
  background: rgba(132, 147, 158, 0.06);
  border-bottom: 1px solid ${colors.divider};
`;

const Inner = styled.div`
  max-width: ${postPageContentMaxWidth}px;
  height: 100%;
  margin: 0 auto;
  padding-left: 60px;
  padding-right: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  ${media.tablet`
    max-width: 100vw;
  `}

  ${media.phone`
    width: 100%;
    max-width: 100vw;
    padding-left: 15px;
    padding-right: 15px;
  `}
`;

const Left = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  margin-right: 20px;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
`;

interface Props {
  rightContent: JSX.Element | null;
  leftContent: JSX.Element | null;
}

export default memo<Props>(({ rightContent, leftContent }) => {
  return (
    <Container>
      <Inner>
        <Left>{leftContent}</Left>
        <Right>{rightContent}</Right>
      </Inner>
    </Container>
  );
});
