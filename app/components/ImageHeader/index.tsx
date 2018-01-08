import * as React from 'react';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const HeaderContainer = styled.div`
  width: 100%;
  height: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-left: 25px;
  padding-right: 25px;
  position: relative;
  z-index: 1;

  ${media.biggerThanPhone`
    height: 360px;
  `}

  ${media.phone`
    min-height: 360px;
  `}
`;

const HeaderOverlay = styled.div`
  background-color: #000;
  opacity: 0.4;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const HeaderBackground: any = styled.div`
  opacity: 0.7;
  background-image: url(${(props: any) => props.src});
  background-repeat: no-repeat;
  background-size: cover;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

export const HeaderTitle = styled.h1`
  font-size: 42px;
  line-height: 48px;
  font-weight: 500;
  text-align: center;
  color: #FFFFFF;
  margin: 0;
  margin-top: 35px;
  padding: 0;
  display: flex;
  z-index: 1;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;

  ${media.tablet`
    font-size: 40px;
    line-height: 48px;
  `}

  ${media.phone`
    font-weight: 600;
    font-size: 34px;
    line-height: 38px;
  `}

  ${media.smallPhone`
    font-weight: 600;
    font-size: 30px;
    line-height: 34px;
  `}
`;

export const HeaderSubtitle = styled.h2`
  color: #fff;
  font-size: 28px;
  line-height: 34px;
  font-weight: 100;
  max-width: 980px;
  text-align: center;
  margin: 0;
  margin-top: 10px;
  padding: 0;
  z-index: 1;
  opacity: 0.8;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;

  ${media.tablet`
    font-size: 28px;
    line-height: 32px;
  `}

  ${media.phone`
    font-size: 24px;
    line-height: 28px;
  `}

  ${media.smallPhone`
    font-size: 20px;
    line-height: 24px;
  `}
`;

type Props = {
  className?: string,
  image?: string,
  children?: any,
};

export default class ImageHeader extends React.PureComponent<Props, {}> {
  render() {
    const { image, children } = this.props;

    return (
      <HeaderContainer>
        <HeaderBackground src={image} />
        <HeaderOverlay />
        {children}
      </HeaderContainer>
    );
  }
}
