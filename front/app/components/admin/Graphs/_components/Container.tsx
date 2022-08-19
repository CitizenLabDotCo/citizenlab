import React, { useState, useEffect } from 'react';
import { ResponsiveContainer } from 'recharts';
import { isEqual } from 'lodash-es';

let idNumber = 0

const getId = () => {
  const id = `_responsive_container_${idNumber}`;
  idNumber++
  return id;
}

interface Dimensions {
  containerWidth: number;
  containerHeight: number;
  width?: number;
  height?: number;
}

interface Props {
  width?: string | number;
  height?: string | number;
  children: (dimensions: Dimensions) => React.ReactElement;
}

const Container = ({ width, height, children }: Props) => {
  const [id, setId] = useState<string | undefined>();
  const [dimensions, setDimensions] = useState<Dimensions | undefined>();

  useEffect(() => {
    setId(getId());
  }, []);

  useEffect(() => {
    if (id === undefined) return;
    
    const container = document.getElementById(id);
    if (container === null) return;

    const newDimensions = {
      containerWidth: container.clientWidth,
      containerHeight: container.clientHeight
    }

    if (!isEqual(dimensions, newDimensions)) {
      setDimensions(newDimensions)
    }
  })

  if (typeof width === 'number' && typeof height === 'number') {
    return children({ containerWidth: width, containerHeight: height })
  }

  if (id === undefined) return null;

  return (
    <ResponsiveContainer 
      width={width}
      height={height}
      id={id}
    >
      {dimensions ? children(dimensions) : <></>}
    </ResponsiveContainer>
  )
}

export default Container;
