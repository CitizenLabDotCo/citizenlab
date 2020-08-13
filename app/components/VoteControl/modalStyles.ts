import { Icon } from 'cl2-component-library';
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

export const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Header = styled.div`
  width: 100%;
  height: 150px;
  display: flex;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;

export const Background = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
`;

export const Foreground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
`;

export const ForegroundIconContainer = styled.div`
  flex: 0 0 60px;
  width: 60px;
  height: 60px;
  margin-top: 50px;
  border-radius: 50%;
  background: #fff;
`;

export const ForegroundIcon = styled(Icon)<{ color: string }>`
  flex: 0 0 60px;
  width: 60px;
  height: 60px;
  fill: ${(props) => props.color};
  margin-bottom: 30px;
`;

export const Title = styled.h1<{ color: string }>`
  color: ${(props) => props.color};
  font-size: ${fontSizes.xxl}px;
  font-weight: 500;
  line-height: normal;
  text-align: center;
  margin: 0;
  margin-top: 5px;
  padding: 0;
`;

export const Subtitle = styled.h2`
  color: ${colors.label};
  font-size: ${fontSizes.large}px;
  font-weight: 300;
  line-height: normal;
  text-align: center;
  margin: 0;
  margin-top: 30px;
  padding: 0;
`;

export const ButtonContainer = styled.div`
  display: flex;
  margin-top: 30px;
`;
