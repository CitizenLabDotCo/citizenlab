import React, { memo } from 'react';
import styled from 'styled-components';
import useLocalize from 'hooks/useLocalize';
import useMapConfig from 'hooks/useMapConfig';
import { media, isRtl, fontSizes, colors } from 'utils/styleUtils';
import { Multiloc } from 'typings';
import { getLayerColor, getLayerIcon } from 'utils/map';
import { Icon, IconNames } from 'cl2-component-library';
import bowser from 'bowser';

const Container = styled.div`
  padding: 20px;
`;

const LegendItems = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  columns: 2;

  ${media.smallerThanMinTablet`
    columns: 1;
  `}
`;

const Item = styled.li`
  color: ${colors.text};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  min-height: 26px;
  -webkit-column-break-inside: avoid;
  page-break-inside: avoid;
  break-inside: avoid;
  overflow: hidden;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const ColorLabel = styled.div`
  flex: 0 0 18px;
  width: 18px;
  height: 18px;
  margin-right: 10px;
  background-color: ${(props) => props.color};
  border-radius: ${(props: any) => props.theme.borderRadius};

  ${isRtl`
    margin-right: 0;
    margin-left: 10px;
  `}
`;

const StyledIcon = styled(Icon)<{ color: string }>`
  fill: ${(props) => props.color};
  flex: 0 0 18px;
  width: 18px;
  margin-right: 10px;

  &.ie {
    height: 18px;
  }

  ${isRtl`
    margin-right: 0;
    margin-left: 10px;
  `}
`;

interface Props {
  projectId: string;
  className?: string;
}

interface ILegendItem {
  title_multiloc: Multiloc;
  color: string;
  iconName?: IconNames;
}

const Legend = memo<Props>(({ projectId, className }) => {
  const mapConfig = useMapConfig({ projectId });
  const localize = useLocalize();
  let hasCustomLegend = false;
  let legend: ILegendItem[] = [];

  if (mapConfig?.attributes?.legend && mapConfig.attributes.legend.length > 0) {
    hasCustomLegend = true;
    legend = mapConfig.attributes.legend;
  } else if (
    mapConfig?.attributes?.layers &&
    mapConfig.attributes.layers.length > 0
  ) {
    legend = mapConfig.attributes.layers.map((layer) => ({
      title_multiloc: layer.title_multiloc,
      color: getLayerColor(layer),
      iconName: getLayerIcon(layer),
    }));
  }

  if (legend.length > 0) {
    return (
      <Container className={`${className || ''} legendcontainer`}>
        <LegendItems>
          {legend.map((legendItem, index) => {
            const color = legendItem.color;
            const iconName = legendItem?.iconName;
            const label = localize(legendItem.title_multiloc);

            return (
              <Item
                key={`legend-item-${index} ${index === 0 ? 'first' : ''} ${
                  index === legend.length - 1 ? 'last' : ''
                }`}
              >
                {hasCustomLegend && color && <ColorLabel color={color} />}
                {!hasCustomLegend && color && iconName && (
                  <StyledIcon
                    name={iconName}
                    color={color}
                    className={bowser.msie ? 'ie' : ''}
                  />
                )}
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
