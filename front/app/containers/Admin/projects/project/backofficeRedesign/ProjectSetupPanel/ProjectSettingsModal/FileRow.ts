import { bo, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

export const FILE_ROW_ACTION_CLASS = 'file-row-action';

const FileRow = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  padding: 0 4px 0 8px;
  border-radius: ${bo.borderRadius};

  & + &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 8px;
    right: 8px;
    height: 1px;
    background: ${colors.grey100};
  }

  &:hover,
  &:focus-within,
  &:has([aria-expanded='true']) {
    background: ${colors.grey50};
  }

  &:hover::before,
  &:hover + &::before,
  &:focus-within::before,
  &:focus-within + &::before,
  &:has([aria-expanded='true'])::before,
  &:has([aria-expanded='true']) + &::before {
    opacity: 0;
  }

  .${FILE_ROW_ACTION_CLASS} {
    opacity: 0;
  }

  &:hover
    .${FILE_ROW_ACTION_CLASS},
    &:focus-within
    .${FILE_ROW_ACTION_CLASS},
    &:has([aria-expanded='true'])
    .${FILE_ROW_ACTION_CLASS} {
    opacity: 1;
  }
`;

export default FileRow;
