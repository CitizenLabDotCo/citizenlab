import React from 'react';
import styled from 'styled-components';
import { fontSizes, themeColors, semanticColors } from '../../utils/styleUtils';
import Title from '../../components/Title';

const Container = styled.div<{ borderColor: string }>`
  width: 500px;
  line-height: normal;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  padding-right: 10px;
  margin: 20px;
  border-radius: ${(props) => props.theme.borderRadius};
  border: ${(props) => '2px solid ' + props.borderColor};
`;
const Color = styled.div<{ backgroundColor?: string }>`
  min-height: 60px;
  min-width: 120px;
  background: ${(props) => props.backgroundColor};
`;

const ColorText = styled.div`
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ColorTextKey = styled.div`
  font-weight: 500;
  font-size: ${fontSizes.xl}px;
`;

const ColorTextValue = styled.p`
  font-weight: 400;
  font-size: ${fontSizes.xs}px;
`;

const Colors = () => {
  return (
    <>
      <Title> Semantic colors</Title>
      {Object.entries(semanticColors)
        .sort()
        .map(([key, value]) => {
          return (
            <Container key={key} borderColor={value}>
              <Color backgroundColor={value} />
              <ColorText>
                <ColorTextKey>{key}</ColorTextKey>
                <ColorTextValue>{value}</ColorTextValue>
              </ColorText>
            </Container>
          );
        })}
      <Title> Theme colors</Title>
      {Object.entries(themeColors)
        .sort()
        .map(([key, value]) => {
          return (
            <Container key={key} borderColor={value}>
              <Color backgroundColor={value} />
              <ColorText>
                <ColorTextKey>{key}</ColorTextKey>
                <ColorTextValue>{value}</ColorTextValue>
              </ColorText>
            </Container>
          );
        })}
    </>
  );
};

export default Colors;
