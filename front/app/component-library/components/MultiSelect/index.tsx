import React from 'react';

import InputContainer from 'component-library/utils/containers/InputContainer';

interface Props {
  title: string | JSX.Element;
}

const MultiSelect = ({ title }: Props) => {
  return <InputContainer>{title}</InputContainer>;
};

export default MultiSelect;
