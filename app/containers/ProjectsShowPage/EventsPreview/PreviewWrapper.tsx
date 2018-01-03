import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Background = styled.div`
  background: #f9f9f9;
  box-sizing: border-box;
  margin: 40px 0;
  overflow: hidden;
  padding: 60px 0 120px 0;
  transition: all .2s ease-in-out;
  width: 100%;

  &.exited {
    max-height: 0;
    padding: 0;
  }

  &.entering,
  &.exiting{
    max-height: 350px;
  }

  &.entered{
    max-height: none;
  }
`;

const Container = styled.div`
  align-items: stretch;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 952px;
  width: 100%;

  > div {
    flex: 1 0 100%;

    ${media.smallerThanMinTablet`
      &.event-placeholder{
        display: none;
      }
    `}

    ${media.biggerThanPhone`
      flex-basis: calc(50% - 1rem);
    `}

    ${media.biggerThanMaxTablet`
      flex-basis: calc(30% - 2rem);
    `}
  }
`;

export default {
  Background,
  Container,
};

