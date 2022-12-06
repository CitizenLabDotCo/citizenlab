import { media } from 'utils/styleUtils';
import styled from 'styled-components';

export default styled.section`
  padding-top: 60px;
  padding-bottom: 80px;

  ${media.phone`
    padding-top: 45px;
    padding-bottom: 45px;
  `}
`;
