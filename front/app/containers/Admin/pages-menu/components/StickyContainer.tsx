import styled from 'styled-components';
import { media, colors } from 'utils/styleUtils';

const StickyContainer = styled.div`
  background-color: #fcfcfc;
  border-top: 1px solid ${colors.separation};

  height: 78px;
  width: calc(100% + 8rem);

  position: sticky;
  bottom: 0;
  margin-left: -4rem;
  margin-bottom: -4rem;
  padding-left: 45px;

  display: flex;
  align-items: center;

  ${media.smallerThan1280px`
    width: calc(100% + 4rem);
    margin-left: -2rem;
    padding-left: 2rem;
  `}

  z-index: 1001;
`;

export default StickyContainer;
