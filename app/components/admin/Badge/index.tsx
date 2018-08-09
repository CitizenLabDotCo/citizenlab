import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

export default styled.div`
  color: ${(props: any) => props.color || colors.mediumGrey};
  font-size: ${fontSizes.xs}px;
  line-height: 16px;
  border-radius: 5px;
  padding: 6px 10px;
  display: inline-block;
  text-transform: uppercase;
  text-align: center;
  font-weight: 500;
  border: solid 1px ${(props: any) => props.color || colors.mediumGrey};
`;
