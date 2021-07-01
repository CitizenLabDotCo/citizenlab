import React from 'react';

export default function getTextOverflow(TElement: React.MutableRefObject<any>) {
  const tElementCurrent: any = TElement?.current;
  if (!tElementCurrent) return true;

  const spanElement = tElementCurrent.state.innerRef.current;
  if (!spanElement) return true;

  const spanChildren = [...spanElement.children];

  const spanHeight = spanElement.clientHeight;
  const spanChildrenHeight = getChildrenHeight(spanChildren);

  return spanChildrenHeight > spanHeight;
}

const getChildrenHeight = (children) =>
  children.reduce((acc, curr) => (acc += curr.clientHeight), 0);
