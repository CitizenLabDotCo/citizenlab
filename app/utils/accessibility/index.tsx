import styled from 'styled-components';
import { hideVisually } from 'polished';

export const HiddenLabel = styled.label`
  span:first-child {
    ${hideVisually()}
  }
`;
