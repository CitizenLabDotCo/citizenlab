import React, { memo } from 'react';

// components
import EsriMap from 'components/EsriMap';
import { IMapLayerAttributes } from 'modules/commercial/custom_maps/api/map_layers/types';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol.js';
import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer.js';
import useLocalize from 'hooks/useLocalize';
import { hexToRGBA } from 'utils/helperUtils';
import { colors } from '@citizenlab/cl2-component-library';
import { getMakiIconUrl, getMapPinSymbol } from 'components/EsriMap/utils';
import PictureMarkerSymbol from '@arcgis/core/symbols/PictureMarkerSymbol.js';

export interface Props {
  center?: GeoJSON.Point;
  zoom?: string;
  layers?: IMapLayerAttributes[];
}

const IdeationConfigurationMap = memo<Props>(
  ({ center, zoom, layers }: Props) => {
    const localize = useLocalize();

    // Create GeoJSON layers to add to Esri map
    const geoJsonLayers = layers?.map((layer) => {
      // create a new blob from geojson featurecollection
      const blob = new Blob([JSON.stringify(layer.geojson)], {
        type: 'application/json',
      });

      // URL reference to the blob
      const url = URL.createObjectURL(blob);

      // create new geojson layer using the blob url
      const geoJsonLayer = new GeoJSONLayer({
        url,
      });

      //   const picRenderer = {
      //     type: 'simple', // autocasts as new SimpleRenderer()
      //     symbol: {
      //       type: 'picture-marker',
      //       url: 'https://static.arcgis.com/images/Symbols/Shapes/BlackStarLargeB.png',
      //     },
      //   } as RendererProperties;

      const geometryType = layer.geojson?.features[0].geometry?.type;

      if (geometryType === 'Polygon') {
        // All features in a layer will have the same symbology, so we can just check the first feature's properties
        const fillColour = layer.geojson?.features[0]?.properties?.fill;
        geoJsonLayer.renderer = new SimpleRenderer({
          symbol: new SimpleFillSymbol({
            color: fillColour
              ? hexToRGBA(fillColour, 0.3)
              : hexToRGBA(colors.coolGrey600, 0.3),
            outline: {
              // autocasts as new SimpleLineSymbol()
              color: fillColour,
              width: 2,
            },
          }),
        });
      } else if (geometryType === 'Point') {
        const pointColour = layer.geojson?.features[0]?.properties?.fill;
        console.log(layer.geojson?.features[0]?.properties?.['marker-symbol']);
        console.log(
          getMakiIconUrl({
            makiSymbol: 'basketball',
            size: 'medium',
            color: 'FF0000',
          })
        );

        geoJsonLayer.renderer = new SimpleRenderer({
          symbol: getMapPinSymbol({ color: pointColour }),
        });
      }

      geoJsonLayer.title = localize(layer.title_multiloc); // Custom legend title
      return geoJsonLayer;
    });

    return (
      <EsriMap
        center={center}
        height={'700px'}
        zoom={Number(zoom)}
        layers={geoJsonLayers}
      />
    );
  }
);

export default IdeationConfigurationMap;
