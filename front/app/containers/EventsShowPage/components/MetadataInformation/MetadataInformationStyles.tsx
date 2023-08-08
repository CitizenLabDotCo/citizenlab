// components
import { Icon, colors } from '@citizenlab/cl2-component-library';

// styles
import styled from 'styled-components';
import { isRtl } from 'utils/styleUtils';

export const Container = styled.div`
  display: flex;
  align-items: center;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

export const StyledIcon = styled(Icon)`
  flex: 0 0 24px;
  fill: ${colors.coolGrey600};
  margin-right: 8px;
  align-self: flex-start;
  margin-top: 2px;

  ${isRtl`
    margin-right: 0;
    margin-left: 8px;
  `}
`;

export const Content = styled.div`
  width: calc(100% - 35px);
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
`;
