import React from 'react';

import { IFlatCustomField } from 'api/custom_fields/types';

interface Props {
  value?: number;
  question: IFlatCustomField;
  onChange: (value: number) => void;
}

const SentimentScale = ({ value: data, question, onChange }: Props) => {
  console.log(data);

  return <></>;
};

export default SentimentScale;
