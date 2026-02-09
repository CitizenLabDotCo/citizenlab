import React, { RefObject } from 'react';

export interface DataRow {
  name: string;
  value: number;
  label: string;
  total: number;
}

export interface ProgressBarsProps {
  data?: DataRow[] | null | Error;
  width?: number | `${number}%`;
  height?: number | `${number}%`;
  emptyContainerContent?: React.ReactNode;
  innerRef?: RefObject<any>;
}
