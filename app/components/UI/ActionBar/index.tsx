import React, { memo } from 'react';

// components
import TranslateButton from '../TranslateButton';
import FeatureFlag from 'components/FeatureFlag';

// styles
import styled from 'styled-components';
import { colors, media, postPageContentMaxWidth } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
  height: 50px;
  background-color: rgba(132, 147, 158, 0.06);
  color: ${colors.label};
  border-bottom: 1px solid ${colors.adminSeparation};
`;

const Inner = styled.div`
  max-width: ${postPageContentMaxWidth};
  height: 100%;
  margin: 0 auto;
  padding-left: 60px;
  padding-right: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  ${media.smallerThanMinTablet`
    width: 100%;
    max-width: auto;
    padding-left: 15px;
    padding-right: 15px;
  `}
`;

const Left = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
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

const StyledRight = styled.div`
  margin-left: 35px;
`;

interface Props {
  rightContent: JSX.Element | null;
  leftContent: JSX.Element | null;
  showTranslateButton: boolean;
  translateButtonClicked: boolean;
  onTranslate: () => void;
}

export default memo<Props>(({ rightContent, leftContent, showTranslateButton, translateButtonClicked, onTranslate }) => {

  return (
    <Container>
      <Inner>
        <Left>
          {leftContent}
        </Left>
        <Right>
          <FeatureFlag name="machine_translations">
            {showTranslateButton &&
              <StyledTranslateButton
                translateButtonClicked={translateButtonClicked}
                onClick={onTranslate}
              />
            }
          </FeatureFlag>
          <StyledRight>
            {rightContent}
          </StyledRight>
        </Right>
      </Inner>
    </Container>
  );
});
