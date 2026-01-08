import React, { useCallback, useState } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';
import { saveAs } from 'file-saver';

import messages from 'containers/Admin/projects/project/inputImporter/ReviewSection/messages';

import { FormattedMessage } from 'utils/cl-intl';
import { requestBlob } from 'utils/requestBlob';

interface Props {
  file: string;
  ideaId: string;
}

const PDFDownloadButton = ({ file, ideaId }: Props) => {
  const [downloading, setDownloading] = useState<boolean>(false);

  const savePdf = useCallback(async () => {
    if (!file) return;

    try {
      setDownloading(true);
      const blob = await requestBlob(file, 'application/pdf');
      saveAs(blob, `import_${ideaId}.pdf`);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    } finally {
      setDownloading(false);
    }
  }, [file, ideaId]);

  return (
    <Box display="flex" justifyContent="flex-start">
      <Button
        buttonStyle="secondary-outlined"
        onClick={() => savePdf()}
        processing={downloading}
        icon="download"
      >
        <FormattedMessage {...messages.downloadPdf} />
      </Button>
    </Box>
  );
};

export default PDFDownloadButton;
