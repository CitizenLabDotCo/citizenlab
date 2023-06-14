import React from 'react';

export default function checkTextOverflow(
  TElement: React.MutableRefObject<any>
) {
  const spanElement = TElement.current;
  if (!spanElement) return;

  const spanChildren = [...spanElement.children];

  const spanHeight = spanElement.clientHeight;
  const spanChildrenHeight = getChildrenHeight(spanChildren);

  return spanChildrenHeight > spanHeight;
}

const getChildrenHeight = (children) =>
  children.reduce((acc, curr) => acc + curr.clientHeight, 0);
