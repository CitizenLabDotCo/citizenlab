import React, { useEffect, useState } from 'react';

// components
import { Text, Spinner, Box } from '@citizenlab/cl2-component-library';
import FullScreenReport from '../FullScreenReport';
import styled from 'styled-components';
import messages from '../../messages';
import { FormattedMessage } from '../../../../../utils/cl-intl';

const PreparingBox = styled(Box)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 1px solid #ccc;
  background: #fff;
  padding-top: 50px;
  text-align: center;
  z-index: 10000;
  opacity: 0.8;
  @media print {
    display: none;
  }
`;

const ReadyBox = styled(PreparingBox)`
  opacity: 0.5;
  background: #c00;
`;

const PrintReport = () => {
  const [isPrintReady, setIsPrintReady] = useState(false);

  useEffect(() => {
    if (isPrintReady) {
      window.print();
    } else {
      setTimeout(() => {
        setIsPrintReady(true);
      }, 5000);
    }
  }, [isPrintReady]);

  const disableMouseHover = () => {
    console.log('Mouse over');
    // e.preventDefault();
  };

  return (
    <>
      {isPrintReady ? (
        <ReadyBox onMouseOver={disableMouseHover} />
      ) : (
        <PreparingBox>
          <Spinner />
          <Text color="primary">
            <FormattedMessage {...messages.printPrepare} />
          </Text>
        </PreparingBox>
      )}
      <FullScreenReport />
    </>
  );
};

export default PrintReport;
