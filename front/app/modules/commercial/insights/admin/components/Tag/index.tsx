import React from 'react';

// styles
import styled, { css } from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';

// components
import {
  Icon,
  Spinner,
  Box,
  BoxMarginProps,
} from '@citizenlab/cl2-component-library';

// TODO: Add Tag to component library once we remove tagging

type Variant = 'primary' | 'default' | 'secondary';
type Size = 'small' | 'large';

export type TagProps = {
  label: string;
  onIconClick?: () => void;
  variant: Variant;
  count?: number;
  className?: string;
  onClick?: () => void;
  loading?: boolean;
  size?: Size;
} & BoxMarginProps;

const IconContainer = styled.div`
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 28px;
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

const StyledTag = styled(Box)<{ variant: Variant; size: Size }>`
  ${({ variant, onClick, theme, size }) => css`
    border-radius: ${theme.borderRadius};
    cursor: default;
    font-size: ${fontSizes.small}px;
    font-weight: normal;
    display: inline-block;
    padding: 4px 12px;
    ${size === 'small' &&
    css`
      padding: 4px 12px;
    `}
    ${size === 'large' &&
    css`
      padding: 10px 16px;
    `}
    ${variant === 'primary' &&
    css`
      background-color: ${colors.clGreen};
      border: 1px solid ${colors.clGreen};
      color: #fff;
    `}
    ${variant === 'secondary' &&
    css`
      background-color: ${colors.label};
      border: 1px solid ${colors.border};
      color: #fff;
    `}
    ${variant === 'default' &&
    css`
      background-color: #fff;
      color: ${colors.label};
      border: 1px solid ${colors.border};
    `}
    ${onClick &&
    css`
      cursor: pointer;
      &:hover,
      &:focus {
        background-color: ${darken(
          0.1,
          variant === 'primary' ? colors.clGreen : '#fff'
        )};
      }
    `}
  `}
`;

const TagContent = styled.div`
  display: flex;
  align-items: center;
  span {
    white-space: nowrap;
    max-width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const StyledSpinner = styled(Spinner)`
  margin-left: 8px;
`;

const Tag = ({
  label,
  onIconClick,
  variant,
  count,
  className,
  onClick,
  loading,
  size = 'small',
  ...rest
}: TagProps) => {
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
      size={size}
      data-testid="insightsTag"
      className={className}
      onClick={onClick}
      as="button"
      tabIndex={onClick ? 0 : -1}
      {...rest}
    >
      <TagContent data-testid={`insightsTagContent-${variant}`}>
        <span> {label}</span>
        {count !== undefined && <Count>{count}</Count>}
        {onIconClick && (
          <>
            {loading ? (
              <div data-testid="insightsTagSpinner">
                <StyledSpinner
                  size="10px"
                  thickness="1px"
                  color={variant === 'primary' ? '#fff' : colors.clGreen}
                />
              </div>
            ) : (
              <IconContainer
                onClick={handleIconClick}
                onKeyPress={handleEnterPress}
                role="button"
                data-testid="insightsTagIconContainer"
                tabIndex={0}
              >
                {variant === 'primary' && (
                  <CloseIcon name="close" className="insightsTagCloseIcon" />
                )}
                {variant === 'secondary' && (
                  <CloseIcon name="close" className="insightsTagCloseIcon" />
                )}
                {variant === 'default' && (
                  <PlusIcon
                    name="plus-circle"
                    className="insightsTagPlusIcon"
                  />
                )}
              </IconContainer>
            )}
          </>
        )}
      </TagContent>
    </StyledTag>
  );
};

export default Tag;
