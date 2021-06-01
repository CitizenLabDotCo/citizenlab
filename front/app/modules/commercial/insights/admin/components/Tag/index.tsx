import React from 'react';
import styled, { css } from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { Icon } from 'cl2-component-library';

type Status = 'approved' | 'suggested';

type TagProps = {
  id: string;
  label: string;
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
  status: 'approved' | 'suggested';
};

const PlusIcon = styled(Icon)`
  height: 14px;
  fill: ${colors.clGreen};
  margin-left: 4px;
`;

const CloseIcon = styled(Icon)`
  height: 10px;
  fill: #fff;
  margin-left: 4px;
`;

const StyledTag = styled.div<{ status: Status }>`
  ${({ status, theme }) => css`
    position: relative;
    cursor: pointer;
    border-radius: ${theme.borderRadius};
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

const Tag = ({ label, onDelete, onApprove, id, status }: TagProps) => {
  const handleClick = () => {
    status === 'approved' ? onDelete(id) : onApprove(id);
  };
  return (
    <StyledTag status={status} tabIndex={0} onClick={handleClick}>
      <TagContent>
        {label}
        {status === 'approved' && <CloseIcon name="close" />}
        {status === 'suggested' && <PlusIcon name="plus-circle" />}
      </TagContent>
    </StyledTag>
  );
};

export default Tag;
