import React from 'react';

// components
import Editor from '../../components/ReportBuilder/Editor';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import { Box } from '@citizenlab/cl2-component-library';

// constants
import { A4_WIDTH } from '../../constants';

// typings
import { SerializedNodes } from '@craftjs/core';

interface Props {
  editorData?: SerializedNodes;
}

const Content = ({ editorData }: Props) => {
  /* Printing adds some arbitrary left margin- picked
     these padding values through trial and error to make it
     look nice and centered */
  return (
    <Box
      width={A4_WIDTH}
      pl="5mm"
      pr="10mm"
      position="absolute"
      background="white"
    >
      <Box>
        <Editor isPreview={true}>
          {editorData && <ContentBuilderFrame editorData={editorData} />}
        </Editor>
      </Box>
    </Box>
  );
};

export default Content;
