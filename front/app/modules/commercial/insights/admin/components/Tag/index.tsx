import React from 'react';
import styled, { css } from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { Icon, Spinner } from 'cl2-component-library';
import { darken } from 'polished';

// TODO: Add Tag to component library once we remove tagging

type Variant = 'primary' | 'secondary';

export type TagProps = {
  label: string;
  onIconClick?: () => void;
  variant: Variant;
  count?: number;
  className?: string;
  onClick?: () => void;
  loading?: boolean;
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

const StyledTag = styled.button<{ variant: Variant }>`
  ${({ variant, onClick, theme }) => css`
    border-radius: ${theme.borderRadius};
    cursor: default;
    font-size: ${fontSizes.small}px;
    font-weight: normal;
    display: inline-block;
    padding: 4px 12px;
    ${
      variant === 'primary' &&
      css`
        background-color: ${colors.clGreen};
        border: 1px solid ${colors.clGreen};
        color: #fff;
      `
    }
    ${
      variant === 'secondary' &&
      css`
        background-color: #fff;
        color: ${colors.label};
        border: 1px solid ${colors.border};
      `
    }
    ${
      onClick &&
      css`
        cursor: pointer;
        &:hover {
          background-color: ${darken(
            0.1,
            variant === 'primary' ? colors.clGreen : '#fff'
          )};
        }
      `
    }
  `}
`;

const TagContent = styled.div`
  display: flex;
  align-items: center;
  white-space: nowrap;
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
      data-testid="insightsTag"
      className={className}
      onClick={onClick}
      tabIndex={onClick ? 0 : -1}
    >
      <TagContent>
        {label}
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
