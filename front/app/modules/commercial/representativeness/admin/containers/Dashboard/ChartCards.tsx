import React from 'react';

// components
import ChartCard from '../../components/ChartCard';

const TEST_GENDER_DATA = [
  { name: 'Female', actualValue: 42, referenceValue: 47 },
  { name: 'Male', actualValue: 49, referenceValue: 45 },
  { name: 'Non-binary', actualValue: 1.2, referenceValue: 1.4 },
  { name: 'Rather not say', actualValue: 7.8, referenceValue: 6.6 },
];

const ChartCards = () => {
  return (
    <>
      <ChartCard data={TEST_GENDER_DATA} />
    </>
  );
};

export default ChartCards;
