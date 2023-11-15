// Libraries
import React, { useState } from 'react';

// typings
import { IParticipationContextType } from 'typings';

// components
import Button from 'components/UI/Button';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

import { exportVolunteers } from 'api/causes/util';
import useCauses from 'api/causes/useCauses';

interface Props {
  participationContextType: IParticipationContextType;
  participationContextId: string;
  className?: string;
}

const ExportVolunteersButton = ({
  participationContextType,
  participationContextId,
  className,
}: Props) => {
  const { data: causes } = useCauses({
    participationContextType,
    participationContextId,
  });
  const [exporting, setExporting] = useState(false);

  const noCauses = causes?.data.length === 0;

  const handleExportVolunteers = async () => {
    setExporting(true);
    await exportVolunteers(participationContextId, participationContextType);
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
