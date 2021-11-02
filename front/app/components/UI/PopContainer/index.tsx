import React, { FC } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { Icon, IconNames } from 'cl2-component-library';
import { colors } from 'utils/styleUtils';

const enterAnimation = keyframes`
  0% {
    transform: scale(1, 0);
    opacity: 0;
  }
  5% { transform: scale(1,0.17942745647835484); }
  10% { transform: scale(1,0.5453767165955569); }
  15% { transform: scale(1,0.894404964443162); }
  20% { transform: scale(1,1.1203760160160154); }
  25% { transform: scale(1,1.2051533263082377); }
  30% { transform: scale(1,1.1848074616294655); }
  35% { transform: scale(1,1.1134007773010595); }
  40% { transform: scale(1,1.037247338664745); }
  45% { transform: scale(1,0.9833121263387835); }
  50% { transform: scale(1,0.9591514931191875); opacity: 1; }
  55% { transform: scale(1,0.9592070055589312); }
  60% { transform: scale(1,0.9725345308087797); }
  65% { transform: scale(1,0.9888015967917715); }
  70% { transform: scale(1,1.0013794350134355); }
  75% { transform: scale(1,1.0078326552211365); }
  80% { transform: scale(1,1.008821093113004); }
  85% { transform: scale(1,1.0064881982177143); }
  90% { transform: scale(1,1.0030929569279976); }
  95% { transform: scale(1,1.00022141474777); }
  100% {
    transform: scale(1, 1);
  }
`;

const Container = styled.div`
  background-color: #fff;
  position: relative;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: solid 1px ${colors.separation};
  margin-top: 0px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
  animation: ${css`
    ${enterAnimation} 450ms linear
  `};
  transform-origin: center center;
`;

const IconWrapper = styled.div`
  width: 42px;
  height: 42px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background: #f0f0f0;
  margin-bottom: 15px;
`;

const StyledIcon = styled(Icon)`
  height: 20px;
  fill: #333;
`;

interface Props {
  icon?: IconNames;
  children: React.ReactNode;
}

/** A bordered container with an icon that animates in with a bouncy animation */
const PopContainer: FC<Props> = ({ icon, children }) => {
  return (
    <Container>
      {icon && (
        <IconWrapper>
          <StyledIcon name={icon} />
        </IconWrapper>
      )}
      {children}
    </Container>
  );
};

export default PopContainer;
