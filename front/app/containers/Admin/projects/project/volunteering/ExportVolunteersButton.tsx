import React, { useState } from 'react';

import useCauses from 'api/causes/useCauses';
import { exportVolunteers } from 'api/causes/util';

import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  phaseId: string;
  className?: string;
}

const ExportVolunteersButton = ({ phaseId, className }: Props) => {
  const { data: causes } = useCauses({
    phaseId,
  });
  const [exporting, setExporting] = useState(false);

  const noCauses = causes?.data.length === 0;

  const handleExportVolunteers = async () => {
    setExporting(true);
    await exportVolunteers(phaseId);
    setExporting(false);
  };

  return (
    <Button
      buttonStyle="secondary"
      icon="download"
      onClick={handleExportVolunteers}
      disabled={noCauses}
      processing={exporting}
      className={className}
    >
      <FormattedMessage {...messages.exportVolunteers} />
    </Button>
  );
};

export default ExportVolunteersButton;
