import { fontSizes, isRtl, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import Avatar from 'components/Avatar';
import UserName from 'components/UI/UserName';

export const BodyWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

export const StyledAvatar = styled(Avatar)`
  margin-right: 6px;
  margin-left: -4px;
  margin-top: -2px;
  ${isRtl`
    margin-left: 6px;
    margin-right: -4px;
  `}
`;

export const BodyDiv = styled.div`
  font-size: ${fontSizes.s}px;
  font-weight: 300;
  color: ${colors.textSecondary};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 21px;
  max-height: 42px;
  overflow: hidden;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
`;

export const StyledUserName = styled(UserName)`
  font-size: ${fontSizes.s}px;
  font-weight: 500;
  color: ${colors.textSecondary};
  font-weight: 500;
`;

export const Separator = styled.span`
  margin-left: 4px;
  margin-right: 4px;
`;

export const TimeAgo = styled.span`
  font-weight: 500;
  margin-right: 5px;
`;
