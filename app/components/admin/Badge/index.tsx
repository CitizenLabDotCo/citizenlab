import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

export default styled.div`
  color: #fff;
  font-size: 12px;
  line-height: 16px;
  border-radius: 5px;
  padding: 6px 12px;
  display: inline-block;
  text-transform: uppercase;
  text-align: center;
  font-weight: 600;
  background-color: ${(props: any) => props.color || colors.mediumGrey}
`;
