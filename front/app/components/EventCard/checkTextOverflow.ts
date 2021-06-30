import React from 'react';

export default function getTextOverflow(TElement: React.MutableRefObject<any>) {
  const tElementCurrent: any = TElement?.current;
  if (!tElementCurrent) return;

  const spanElement = tElementCurrent.state.innerRef.current;
  if (!spanElement) return;

  const spanChildren = [...spanElement.children];

  const spanHeight = spanElement.style.height;
  const spanChildrenHeight = getChildrenHeight(spanChildren);

  return spanChildrenHeight > spanHeight;
}

const getChildrenHeight = (children) =>
  children.reduce((acc, curr) => (acc += curr.style.height), 0);
