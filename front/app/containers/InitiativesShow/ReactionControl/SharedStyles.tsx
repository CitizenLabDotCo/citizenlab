import styled from 'styled-components';
import { fontSizes } from '@citizenlab/cl2-component-library';

export const StatusWrapper = styled.div`
  display: flex;
  font-size: ${fontSizes.base}px;
  font-weight: bold;
  text-transform: capitalize;
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
