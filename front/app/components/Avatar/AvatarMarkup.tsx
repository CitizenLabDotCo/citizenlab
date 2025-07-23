import React from 'react';

import { Icon, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useFeatureFlag from 'hooks/useFeatureFlag';

export const Container = styled.div<{ size: number }>`
  flex: 0 0 ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

export const AvatarImage = styled.img<{
  size: number;
  padding: number;
  bgColor: string | undefined;
  borderColor: string | undefined;
  borderThickness: number;
  borderHoverColor: string | undefined;
}>`
  flex: 0 0 ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  padding: ${({ padding }) => padding}px;
  border-radius: 50%;
  border-style: ${({ borderThickness }) =>
    borderThickness === 0 ? 'none' : 'solid'};
  border-width: ${({ borderThickness }) => `${borderThickness}px`};
  border-color: ${({ borderColor }) => borderColor || 'transparent'};
  background: ${({ bgColor }) => bgColor || 'transparent'};

  &.hasHoverEffect {
    cursor: pointer;
    transition: all 100ms ease-out;

    &:hover {
      border-color: ${({ borderHoverColor }) =>
        borderHoverColor || 'transparent'};
    }
  }
`;

const AvatarIcon = styled(Icon)<{
  size: number;
  fillColor: string | undefined;
  fillHoverColor: string | undefined;
  paddingValue: number;
  bgColor: string | undefined;
  borderColor: string | undefined;
  borderThickness: number;
  borderHoverColor: string | undefined;
}>`
  flex: 0 0 ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  fill: ${({ fillColor }) => fillColor || ''};
  padding: ${({ paddingValue }) => paddingValue}px;
  border-radius: 50%;
  border-style: ${({ borderThickness }) =>
    borderThickness === 0 ? 'none' : 'solid'};
  border-width: ${({ borderThickness }) => `${borderThickness}px`};
  border-color: ${({ borderColor }) => borderColor || 'transparent'};
  background: ${({ bgColor }) => bgColor || 'transparent'};

  &.hasHoverEffect {
    cursor: pointer;
    transition: all 100ms ease-out;

    &:hover {
      border-color: ${({ borderHoverColor }) =>
        borderHoverColor || 'transparent'};
      fill: ${({ fillHoverColor }) => fillHoverColor || ''};
    }
  }
`;

const BadgeIcon = styled(Icon)<{ size: number; fill: string }>`
  fill: ${({ fill }) => fill};
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  position: absolute;
  right: 0px;
  bottom: 0px;
  border-radius: 50%;
  background: #fff;
  border: solid 2px #fff;
`;

interface Props {
  className?: string;
  containerSize: number;
  avatarSrc?: string;
  hasHoverEffect: boolean;
  borderThickness: number;
  borderColor: string;
  borderHoverColor: string;
  showModeratorStyles?: boolean;
  bgColor?: string;
  paddingValue: number;
  fillColor: string;
  fillHoverColor: string;
  badgeSize: number;
  verified?: boolean;
  addVerificationBadge?: boolean;
}

const AvatarMarkup = ({
  className,
  containerSize,
  avatarSrc,
  hasHoverEffect,
  borderThickness,
  borderColor,
  borderHoverColor,
  showModeratorStyles,
  bgColor,
  paddingValue,
  fillColor,
  fillHoverColor,
  badgeSize,
  verified,
  addVerificationBadge,
}: Props) => {
  const verificationEnabled = useFeatureFlag({ name: 'verification' });

  return (
    <Container aria-hidden className={className} size={containerSize}>
      {avatarSrc ? (
        <AvatarImage
          className={`avatarImage ${hasHoverEffect ? 'hasHoverEffect' : ''}`}
          src={avatarSrc}
          alt=""
          size={containerSize}
          borderThickness={borderThickness}
          borderColor={borderColor}
          borderHoverColor={
            showModeratorStyles ? colors.red600 : borderHoverColor
          }
          bgColor={bgColor}
          padding={paddingValue}
        />
      ) : (
        <AvatarIcon
          className={`avatarIcon ${hasHoverEffect ? 'hasHoverEffect' : ''}`}
          name="user-circle"
          size={containerSize}
          fillColor={fillColor}
          fillHoverColor={fillHoverColor}
          borderThickness={borderThickness}
          borderColor={borderColor}
          borderHoverColor={
            showModeratorStyles ? colors.red600 : borderHoverColor
          }
          bgColor={bgColor}
          paddingValue={paddingValue}
        />
      )}

      {showModeratorStyles && (
        <BadgeIcon name="cl-favicon" size={badgeSize} fill={colors.red600} />
      )}

      {verified && addVerificationBadge && verificationEnabled && (
        <BadgeIcon name="check-circle" size={badgeSize} fill={colors.success} />
      )}
    </Container>
  );
};

export default AvatarMarkup;
