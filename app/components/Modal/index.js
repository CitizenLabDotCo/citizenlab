import React, { PropTypes } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding-left: 40px;
  padding-right: 40px;
  z-index: 4;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: scroll;
  background: rgba(0, 0, 0, 0.45);
  -webkit-backface-visibility: hidden;
  transition: all 350ms cubic-bezier(0.165, 0.84, 0.44, 1) 10ms;
`;

const Content = styled.div`
  width: 100%;
  max-width: 600px;
  height: 2000px;
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-radius: 10px;
  background: #fff;
  margin-left: auto;
  margin-right: auto;
  position: relative;
`;

function Modal(props) {
  return (
    <Container>
      <Content>
        {props.children}
      </Content>
    </Container>
  );
}

Modal.propTypes = {
  children: PropTypes.any.isRequired,
};

export default Modal;
