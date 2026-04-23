import React from 'react';

import { Box, Button, Tooltip } from '@citizenlab/cl2-component-library';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  printedFormsEnabled: boolean;
  onClickPDFImport?: () => void;
  importerPath: string;
}

const PDFImportButton = ({
  printedFormsEnabled,
  onClickPDFImport,
  importerPath,
}: Props) => {
  if (!printedFormsEnabled) {
    return (
      <Tooltip
        content={
          <Box display="flex" flexDirection="column" gap="8px">
            <FormattedMessage {...messages.unlockScanningTooltip1} />
            <FormattedMessage {...messages.unlockScanningTooltip2} />
          </Box>
        }
        theme="dark"
      >
        {/* Empty button used to match designs, as this is admin-only it is fine */}
        <Button buttonStyle="admin-dark" icon="lock" disabled>
          <FormattedMessage {...messages.unlockScanning} />
        </Button>
      </Tooltip>
    );
  }

  if (onClickPDFImport) {
    return (
      <Button
        buttonStyle="admin-dark"
        icon="form-sync"
        onClick={onClickPDFImport}
      >
        <FormattedMessage {...messages.importScans} />
      </Button>
    );
  }

  return (
    <ButtonWithLink
      buttonStyle="admin-dark"
      icon="form-sync"
      linkTo={importerPath}
    >
      <FormattedMessage {...messages.importScans} />
    </ButtonWithLink>
  );
};

export default PDFImportButton;
