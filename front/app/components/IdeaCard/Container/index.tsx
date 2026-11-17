import {
  Box,
  defaultCardStyle,
  defaultCardHoverStyle,
  media,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

const Container = styled(Box)`
  display: block;
  ${defaultCardStyle};
  cursor: pointer;
  ${defaultCardHoverStyle};
  width: 100%;
  height: 100%;
  display: flex;
  padding: 17px;

  ${media.tablet`
    flex-direction: column;
  `}
`;

export default Container;
