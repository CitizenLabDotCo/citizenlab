import React from 'react';

import { Option } from './typings';

interface Props {
  title: string | JSX.Element;
  selected: string[];
  options: Option[];
}

const TitleMessage = ({ title, selected, options }: Props) => {
  if (selected.length === 0) {
    return title;
  }

  if (selected.length === 1) {
    const selectedOption = options.find(
      (option) => option.value === selected[0]
    );
    return (
      <>
        {title}: {selectedOption?.label ?? ''}
      </>
    );
  }

  return (
    <>
      {title} ({selected.length})
    </>
  );
};

export default TitleMessage;
