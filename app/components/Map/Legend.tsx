import React, { memo } from 'react';
import styled from 'styled-components';
import useLocalize from 'hooks/useLocalize';
import useMapConfig from 'hooks/useMapConfig';
import { isNilOrError } from 'utils/helperUtils';
import { media } from 'utils/styleUtils';

const LegendContainer = styled.div`
  background-color: white;
  padding: 30px;
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

  ${media.smallerThanMinTablet`
    flex: 1 0 calc(100% - 10px);
  `}
`;

const ColorLabel = styled.div`
  width: 20px;
  height: 20px;
  background-color: ${(props) => props.color};
  margin-right: 10px;
`;

interface Props {
  projectId: string;
}

const Legend = memo(({ projectId }: Props) => {
  const mapConfig = useMapConfig({ projectId });
  const legend = !isNilOrError(mapConfig) && mapConfig.attributes.legend;
  const localize = useLocalize();

  if (legend) {
    return (
      <LegendContainer>
        <LegendItems>
          {legend.map((legendItem, index) => {
            const color = legendItem.color;
            const label = localize(legendItem.title_multiloc);

            return (
              <Item key={`legend-item-${index}`}>
                <ColorLabel color={color} />
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
