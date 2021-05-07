import React, { memo } from 'react';
import styled, { css } from 'styled-components';
import { darken } from 'polished';
import useLeaflet, { ILeafletMapConfig } from './useLeaflet';
import { media } from 'utils/styleUtils';

const LeafletMapContainer = styled.div<{ mapHeight: string | undefined }>`
  flex: 1;
  overflow: hidden;
  position: relative;

  ${(props) => {
    const { mapHeight } = props;

    if (mapHeight) {
      return css`
        height: ${mapHeight};
      `;
    }

    return css`
      height: calc(100vh - 300px);
      max-height: 700px;

      ${media.smallerThan1100px`
        height: calc(100vh - 180px);
      `}
    `;
  }}

  .marker-cluster-custom {
    background: #004949;
    border: 3px solid white;
    border-radius: 50%;
    color: white;
    height: 40px;
    line-height: 37px;
    text-align: center;
    width: 40px;

    &:hover {
      background: ${darken(0.2, '#004949')};
    }
  }
`;

interface BaseProps {
  id: string;
  className?: string;
  mapHeight?: string;
}

const LeafletMap = memo(
  ({
    id,
    className,
    mapHeight,
    ...useLeafletOptions
  }: BaseProps & ILeafletMapConfig) => {
    useLeaflet(id, useLeafletOptions);

    return (
      <LeafletMapContainer
        id={id}
        className={className}
        mapHeight={mapHeight}
      />
    );
  }
);

export default LeafletMap;
