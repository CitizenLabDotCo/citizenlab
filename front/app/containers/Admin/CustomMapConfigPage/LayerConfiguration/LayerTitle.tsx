import React, { ReactNode } from 'react';

import { colors, fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import styles from './LayerConfiguration.module.css';

const LayerName = styled.div`
  color: ${colors.primary};
  font-size: ${fontSizes.m}px;
  line-height: normal;
  font-weight: 400;
  flex: 1;
  display: flex;
  align-items: center;
`;

interface Props {
  variant: 'default' | 'panel';
  children: ReactNode;
}

const LayerTitle = ({ variant, children }: Props) =>
  variant === 'panel' ? (
    <div className={styles.layerTitle}>
      <span className={styles.layerTitleText}>{children}</span>
    </div>
  ) : (
    <LayerName>{children}</LayerName>
  );

export default LayerTitle;
