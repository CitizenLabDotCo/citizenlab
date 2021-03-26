import React, { memo } from 'react';

// components
import TranslateButton from 'components/UI/TranslateButton';
import FeatureFlag from 'components/FeatureFlag';

// styles
import styled from 'styled-components';
import { colors, media } from 'utils/styleUtils';
import { postPageContentMaxWidth } from './styleConstants';

const Container = styled.div`
  width: 100%;
  height: 50px;
  color: ${colors.label};
  background: rgba(132, 147, 158, 0.06);
  border-bottom: 1px solid ${colors.adminSeparation};
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

  ${media.smallerThanMaxTablet`
    max-width: 100vw;
  `}

  ${media.smallerThanMinTablet`
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

const StyledTranslateButton = styled(TranslateButton)`
  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

interface Props {
  rightContent: JSX.Element | null;
  leftContent: JSX.Element | null;
  showTranslateButton: boolean;
  translateButtonClicked: boolean;
  onTranslate: () => void;
}

export default memo<Props>(
  ({
    rightContent,
    leftContent,
    showTranslateButton,
    translateButtonClicked,
    onTranslate,
  }) => {
    return (
      <Container>
        <Inner>
          <Left>{leftContent}</Left>
          <Right>
            <FeatureFlag name="machine_translations">
              {showTranslateButton && (
                <StyledTranslateButton
                  translateButtonClicked={translateButtonClicked}
                  onClick={onTranslate}
                />
              )}
            </FeatureFlag>
            {rightContent}
          </Right>
        </Inner>
      </Container>
    );
  }
);
