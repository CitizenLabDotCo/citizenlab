import React from 'react';
import styled from 'styled-components';
import { fontSizes } from '../../utils/styleUtils';
import Icon, { icons, IconNames } from '../../components/Icon';

const Container = styled.div`
  width: 500px;
  line-height: normal;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  padding-right: 10px;
  margin: 20px;
  border-radius: ${(props) => props.theme.borderRadius};
`;

const IconText = styled.div`
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  div {
    font-weight: 500;
    font-size: ${fontSizes.xl}px;
  }
  p {
    font-weight: 400;
    font-size: ${fontSizes.xs}px;
  }
`;

const Icons = () => {
  return (
    <>
      {Object.keys(icons)
        .sort()
        .map((key) => {
          return (
            <Container key={key}>
              <Icon name={key as IconNames} width="24px" height="24px" />
              <IconText>
                <div>{key}</div>
              </IconText>
            </Container>
          );
        })}
    </>
  );
};

export default Icons;
