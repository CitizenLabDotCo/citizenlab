import React from 'react';
import styled, { css } from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { Icon } from 'cl2-component-library';

// TODO: Add Tag to component library once we remove tagging

type Status = 'approved' | 'suggested';

export type TagProps = {
  id: string;
  label: string;
  onIconClick: (id: string) => void;
  status: 'approved' | 'suggested';
};

const IconContainer = styled.div`
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  margin: -5px;
`;

const PlusIcon = styled(Icon)`
  height: 14px;
  fill: ${colors.clGreen};
  margin-left: 5px;
`;

const CloseIcon = styled(Icon)`
  height: 10px;
  fill: #fff;
  margin-left: 5px;
`;

const StyledTag = styled.div<{ status: Status }>`
  ${({ status, theme }) => css`
    border-radius: ${theme.borderRadius};
    cursor: default;
    font-size: ${fontSizes.small}px;
    font-weight: normal;
    display: inline-block;
    padding: 4px 12px;
    ${status === 'approved' &&
    css`
      background-color: ${colors.clGreen};
      color: #fff;
    `}
    ${status === 'suggested' &&
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
`;

const Tag = ({ label, onIconClick, id, status }: TagProps) => {
  const handleIconClick = () => {
    onIconClick(id);
  };

  return (
    <StyledTag status={status} data-testid="insightsTag">
      <TagContent>
        {label}
        <IconContainer
          onClick={handleIconClick}
          role="button"
          data-testid="insightsTagIconContainer"
        >
          {status === 'approved' && (
            <CloseIcon name="close" className="insightsTagCloseIcon" />
          )}
          {status === 'suggested' && (
            <PlusIcon name="plus-circle" className="insightsTagPlusIcon" />
          )}
        </IconContainer>
      </TagContent>
    </StyledTag>
  );
};

export default Tag;
