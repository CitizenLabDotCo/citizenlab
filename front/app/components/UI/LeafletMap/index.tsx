import React, { memo } from 'react';
import styled, { css } from 'styled-components';
import useLeaflet, { ILeafletMapConfig } from './useLeaflet';
import { media, fontSizes } from 'utils/styleUtils';

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
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    border-radius: 50%;
    border: 2px solid #000;

    & > span {
      color: #000;
      font-weight: 600;
      font-size: ${fontSizes.medium}px;
      line-height: normal;
      text-align: center;
    }

    &:hover {
      background: #000;
      border-color: #000;

      & > span {
        color: #fff;
      }
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
