import styled from 'styled-components';
import { fontSizes, colors, media } from 'utils/styleUtils';

export const StatusWrapper = styled.div`
  display: flex;
  flex-direction: row-reverse;
  font-size: ${fontSizes.s};
  text-transform: uppercase;
  color: ${colors.coolGrey600};

  &.answered {
    color: ${colors.success};
  }

  ${media.tablet`
    display: none;
  `}
`;

export const StatusExplanation = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${(props) => props.theme.colors.tenantText};
  line-height: 23px;

  .tooltip-icon {
    margin-left: 3px;
    display: inline-block;
  }

  b {
    font-weight: 600;
    background-color: rgba(255, 197, 47, 0.16);
  }
`;
