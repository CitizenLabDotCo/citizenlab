import styled from 'styled-components';
import { media } from 'utils/styleUtils';

export default styled.section`
  padding-top: 60px;
  padding-bottom: 80px;

  ${media.smallerThanMinTablet`
    padding-top: 45px;
    padding-bottom: 45px;
  `}
`;
