import styled from 'styled-components';

const Background = styled.div`
  background: #f9f9f9;
  box-sizing: border-box;
  margin: 40px 0;
  overflow: hidden;
  padding: 60px 0 120px 0;
  transition: max-height .2s ease-in-out;
  width: 100%;

  &.exited {
    max-height: 0;
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
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 952px;
  width: 100%;
`;

export default {
  Background,
  Container,
};

