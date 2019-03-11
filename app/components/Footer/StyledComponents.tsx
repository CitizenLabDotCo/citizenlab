// style
import styled from 'styled-components';
import Polymorph from 'components/Polymorph';
import { media, colors, fontSizes } from 'utils/styleUtils';

// components
import Link from 'utils/cl-router/Link';
import Icon from 'components/UI/Icon';

export const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const FirstLine = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-right: 20px;
  padding-left: 20px;
  padding-top: 110px;
  padding-bottom: 130px;
  background: #fff;
`;

export const LogoLink = styled.a`
  cursor: pointer;
`;

export const TenantLogo = styled.img`
  height: 50px;
  margin-bottom: 20px;
`;

export const TenantSlogan = styled.div`
  width: 100%;
  max-width: 340px;
  color: ${(props) => props.theme.colorText};
  font-size: ${fontSizes.xl}px;
  font-weight: 500;
  line-height: 28px;
  text-align: center;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
`;

export const SecondLine = styled.div`
  width: 100%;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-top: 6px solid ${colors.adminBackground};
  padding: 12px 28px;
  position: relative;

  ${media.smallerThanMaxTablet`
    display: flex;
    text-align: center;
    flex-direction: column;
    justify-content: center;
  `}
`;

export const ShortFeedbackContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 13px 25px;
  background-color: ${colors.adminBackground};
  color: ${(props) => props.theme.colorText};
  position: absolute;
  top: -49px;
  left: 0;

  ${media.largePhone`
    width: 100%;
  `}
`;

export const ThankYouNote = styled.span`
  display: block;
  padding: 1.5px 0;
  font-size: ${fontSizes.base}px;
  font-weight: 600;
`;

export const FeedbackQuestion = styled.span`
  font-size: ${fontSizes.base}px;
  margin-right: 12px;

  ${media.largePhone`
    font-size: ${fontSizes.small}px;
    margin-right: 5px;
  `}
`;

export const Buttons = styled.div`
  display: flex;
`;

export const FeedbackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.theme.colorText};
  font-weight: 600;
  text-transform: uppercase;
  padding: 0 12px;
  margin-bottom: -3px;
  z-index: 1;

  ${media.largePhone`
    padding: 0 8px;
  `}

  &:focus,
  &:hover {
    outline: none;
    cursor: pointer;
    text-decoration: underline;
  }
`;

export const PagesNav = styled.nav`
  color: ${colors.label};
  flex: 1;
  text-align: left;

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    display: inline-block;

    &:not(:first-child):before {
      content: '•';
      margin-left: 10px;
      margin-right: 10px;
    }
    button {
      white-space: nowrap;
      cursor: pointer;
    }
  }

  ${media.smallerThanMaxTablet`
    order: 2;
    text-align: center;
    justify-content: center;
    margin-top: 10px;
    margin-bottom: 15px;
  `}
`;

export const StyledThing = styled(Polymorph)`
  color: ${colors.label};
  font-weight: 400;
  font-size: ${fontSizes.small}px;
  line-height: 19px;
  text-decoration: none;
  padding: 0;

  &:hover {
    color: #000;
  }

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.small}px;
    line-height: 16px;
  `}
`;

export const StyledButton = StyledThing.withComponent('button');
export const StyledLink = StyledThing.withComponent(Link);

export const Separator = styled.span`
  color: ${colors.label};
  font-weight: 400;
  font-size: ${fontSizes.base}px;
  line-height: 19px;
  padding-left: 10px;
  padding-right: 10px;

  ${media.smallerThanMaxTablet`
    padding-left: 8px;
    padding-right: 8px;
  `}
`;

export const Right = styled.div`
  display: flex;
  align-items: center;

  ${media.smallerThanMaxTablet`
    order: 1;
    margin-top: 15px;
    margin-bottom: 10px;
  `}

  ${media.largePhone`
    margin-top: 25px;
  `}
`;

export const PoweredBy = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  line-height: ${fontSizes.base}px;
  text-decoration: none;
  display: flex;
  align-items: center;
  outline: none;
  padding: 10px 25px 10px 0;
  margin-right: 30px;
  border-right: 1px solid #E8E8E8;

  ${media.smallerThanMaxTablet`
    color: #333;
  `}

  ${media.largePhone`
    color: #333;
    margin-right: 20px;
    padding-right: 15px;
  `}
`;

export const PoweredByText = styled.span`
  margin-right: 5px;

  ${media.largePhone`
    margin-right: 0;
    font-size: ${fontSizes.small}px;
  `}
`;

export const CitizenlabLink = styled.a`
  width: 151px;
  height: 27px;
  flex: 0 0 151px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: 8px;

  ${media.largePhone`
    width: 111.85px;
    height: 20px;
    flex: 0 0 111.85px;
  `}
`;

export const CitizenlabName = styled.span`
  color: #000;
  white-space: nowrap;
  overflow: hidden;
  text-indent: -9999px;
`;

export const CitizenlabLogo: any = styled.svg`
  width: 151px;
  height: 27px;
  fill: ${colors.clIconSecondary};
  transition: all 150ms ease-out;
  &:hover {
    fill: #000;
  }

  ${media.largePhone`
    width: 111.85px;
    height: 20px;
  `}
`;

export const SendFeedback = styled.a`
  margin-right: 20px;

  ${media.largePhone`
    margin-right: 0;
  `}
`;

export const SendFeedbackText = styled.span`
  display: none;
`;

export const SendFeedbackIcon = styled(Icon)`
  fill: ${colors.clIconSecondary};
  height: 34px;

  &:hover {
    cursor: pointer;
    fill: #000;
  }
`;
