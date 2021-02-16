import React, { memo } from 'react';
import styled from 'styled-components';
import useLocalize from 'hooks/useLocalize';
import useMapConfig from 'hooks/useMapConfig';
import { media, isRtl } from 'utils/styleUtils';

const Container = styled.div`
  padding: 25px;
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

  ${isRtl`
    margin-right: 0;
    margin-left: 10px;
    flex-direction: row-reverse;
  `}

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
  border-radius: ${(props: any) => props.theme.borderRadius};

  ${isRtl`
    margin-right: 0;
    margin-left: 10px;
  `}
`;

interface Props {
  projectId: string;
  className?: string;
}

const Legend = memo<Props>(({ projectId, className }) => {
  const mapConfig = useMapConfig({ projectId });
  const localize = useLocalize();

  if (
    (mapConfig?.attributes?.legend &&
      mapConfig?.attributes?.legend?.length > 0) ||
    (mapConfig?.attributes?.layers && mapConfig?.attributes?.layers?.length > 0)
  ) {
    const legend =
      mapConfig.attributes.legend ||
      mapConfig?.attributes?.layers?.map((layer) => ({
        title_multiloc: layer.title_multiloc,
        color:
          layer.geojson?.features?.[0]?.properties?.['marker-color'] ||
          layer.geojson?.features?.[0]?.properties?.fill,
      }));

    return (
      <Container className={`${className || ''} legendContainer`}>
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
      </Container>
    );
  }

  return null;
});

export default Legend;
