import React from 'react';
import Layout1 from './Layout1';
import Layout2 from './Layout2';
import Layout3 from './Layout3';

interface Props {}

const SignedOutHeaderIndex = ({}: Props) => {
  const l = 2;
  return {
    1: <Layout1 />,
    2: <Layout2 />,
    3: <Layout3 />,
  }[l];
};

export default SignedOutHeaderIndex;
