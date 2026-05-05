import React from 'react';

import { Button } from '@citizenlab/cl2-component-library';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  onClickExcelImport?: () => void;
  importerPath?: string;
  inputImporterAllowed: boolean;
}

const ExcelImportButton = ({
  onClickExcelImport,
  importerPath,
  inputImporterAllowed,
}: Props) => {
  if (onClickExcelImport) {
    return (
      <Button
        buttonStyle="text"
        icon="upload-file"
        onClick={onClickExcelImport}
        disabled={!inputImporterAllowed}
      >
        <FormattedMessage {...messages.importFile} />
      </Button>
    );
  }

  return importerPath ? (
    <ButtonWithLink
      buttonStyle="text"
      icon="upload-file"
      linkTo={importerPath}
      disabled={!inputImporterAllowed}
    >
      <FormattedMessage {...messages.importFile} />
    </ButtonWithLink>
  ) : null;
};

export default ExcelImportButton;
