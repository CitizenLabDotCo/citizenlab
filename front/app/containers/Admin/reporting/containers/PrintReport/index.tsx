import { Box } from '@citizenlab/cl2-component-library';
import React from 'react';
import FullScreenReport from '../FullScreenReport';

const PrintReport = () => {
  // Temp solution for demo purposes - crashes though
  // const [isPrinting, setIsPrinting] = useState(false);
  // useEffect(() => {
  //   setTimeout(() => {
  //     if (!isPrinting) {
  //       setIsPrinting(true);
  //       console.log("PRINTING");
  //       // window.print();
  //     }
  //   }, 5000);
  // });

  return (
    <Box>
      <FullScreenReport />
    </Box>
  );
};

export default PrintReport;
