import React from 'react';
import SignedOutHeader from './SignedOutHeader';
import Layout1 from './Layout1';
import Layout2 from './Layout2';
import Layout3 from './Layout3';

interface Props {}

const SignedOutHeaderIndex = ({}: Props) => {
  const l = 1;
  return {
    1: <SignedOutHeader />,
    2: <SignedOutHeader />,
    3: <SignedOutHeader />,
  }[l];
};

export default SignedOutHeaderIndex;
