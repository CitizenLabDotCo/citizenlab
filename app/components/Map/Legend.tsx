import React, { memo } from 'react';
import styled from 'styled-components';
import { IMapConfigData } from 'services/mapConfigs';
import useLocalize from 'hooks/useLocalize';

const LegendContainer = styled.div`
  background-color: white;
  padding: 30px;
`;

const Title = styled.h4`
  margin-bottom 15px;
`;

const LegendItems = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
`;

const Item = styled.li`
  display: flex;
  flex: 1 0 calc(50% - 10px);
  margin-right: 10px;

  &:not(:last-child) {
    margin-bottom: 10px;
  }
`;

const ColorLabel = styled.div`
  width: 20px;
  height: 20px;
  background-color: ${props => props.color};
  margin-right: 10px;
`;

interface Props {
  currentLayerTitle: string;
  mapConfig: IMapConfigData;
}

const Legend = memo(({ currentLayerTitle, mapConfig }: Props) => {
  const localize = useLocalize();
  const currentLayer = mapConfig.attributes.layers.find(layer => localize(layer.title_multiloc) === currentLayerTitle);

  if (currentLayer) {
    const legend = currentLayer.legend;
    const legendTitle = localize(currentLayer.title_multiloc);

    return (
      <LegendContainer>
      <Title>
        {legendTitle}
      </Title>
      <LegendItems>
        {legend.map((legendItem, index) => {
          const color: string | undefined = legendItem.color;
          const label = localize(legendItem.title_multiloc);
          return (
            <Item key={`legend-item-${index}`}>
              {color && <ColorLabel color={color} />}
              {label}
            </Item>
          );
        })}
      </LegendItems>
    </LegendContainer>
    );
  }

  return null;
});

export default Legend;
