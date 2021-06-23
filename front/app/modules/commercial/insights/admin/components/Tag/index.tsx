import React from 'react';
import styled, { css } from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { Icon } from 'cl2-component-library';

// TODO: Add Tag to component library once we remove tagging

type Variant = 'primary' | 'secondary';

export type TagProps = {
  label: string;
  onIconClick?: () => void;
  variant: Variant;
  count?: number;
  className?: string;
};

const IconContainer = styled.div`
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  // Increases the clickable surface area
  padding: 4px 8px 4px 0px;
  margin: -4px -8px -4px 0px;
`;

const PlusIcon = styled(Icon)`
  margin-left: 8px;
  height: 14px;
  fill: ${colors.clGreen};
`;

const CloseIcon = styled(Icon)`
  margin-left: 8px;
  height: 10px;
  fill: #fff;
`;

const Count = styled.div`
  margin-left: 8px;
`;

const StyledTag = styled.div<{ variant: Variant }>`
  ${({ variant, theme }) => css`
    border-radius: ${theme.borderRadius};
    cursor: default;
    font-size: ${fontSizes.small}px;
    font-weight: normal;
    display: inline-block;
    padding: 4px 12px;
    ${variant === 'primary' &&
    css`
      background-color: ${colors.clGreen};
      color: #fff;
    `}
    ${variant === 'secondary' &&
    css`
      background-color: #fff;
      color: ${colors.label};
      border: 1px solid ${colors.border};
    `}
  `}
`;

const TagContent = styled.div`
  display: flex;
  align-items: center;
  white-space: nowrap;
`;

const Tag = ({ label, onIconClick, variant, count, className }: TagProps) => {
  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onIconClick && onIconClick();
  };

  const handleEnterPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.stopPropagation();
      e.preventDefault();
      onIconClick && onIconClick();
    }
  };
  return (
    <StyledTag
      variant={variant}
      data-testid="insightsTag"
      className={className}
    >
      <TagContent>
        {label}
        {count && <Count>{count}</Count>}
        {onIconClick && (
          <IconContainer
            onClick={handleIconClick}
            onKeyPress={handleEnterPress}
            role="button"
            data-testid="insightsTagIconContainer"
          >
            {variant === 'primary' && (
              <CloseIcon name="close" className="insightsTagCloseIcon" />
            )}
            {variant === 'secondary' && (
              <PlusIcon name="plus-circle" className="insightsTagPlusIcon" />
            )}
          </IconContainer>
        )}
      </TagContent>
    </StyledTag>
  );
};

export default Tag;
