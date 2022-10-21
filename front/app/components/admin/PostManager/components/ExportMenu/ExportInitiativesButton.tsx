import Button from 'components/UI/Button';
import React, { useState } from 'react';
import { fontSizes } from 'utils/styleUtils';

// i18n
import { API_PATH } from 'containers/App/constants';
import { saveAs } from 'file-saver';
import { WrappedComponentProps } from 'react-intl';
import { trackEventByName } from 'utils/analytics';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { isString } from 'utils/helperUtils';
import { reportError } from 'utils/loggingUtils';
import { requestBlob } from 'utils/request';
import messages from '../../messages';
import tracks from '../../tracks';
import { exportType } from '../ExportMenu';

interface Props {
  exportQueryParameter: 'all' | string | string[];
  exportType: exportType;
}

const ExportInitiativesButton = ({
  exportQueryParameter,
  exportType,
  intl: { formatDate, formatMessage },
}: Props & WrappedComponentProps) => {
  const [exporting, setExporting] = useState(false);
  const handleExportInitiatives = async () => {
    const queryParametersObject = {};
    if (isString(exportQueryParameter) && exportQueryParameter !== 'all') {
      queryParametersObject['project'] = exportQueryParameter;
    } else if (!isString(exportQueryParameter)) {
      queryParametersObject['initiatives'] = exportQueryParameter;
    }

    try {
      setExporting(true);
      const blob = await requestBlob(
        `${API_PATH}/initiatives/as_xlsx`,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        queryParametersObject
      );
      saveAs(
        blob,
        `${formatMessage(messages.initiativesExportFileName)}_${formatDate(
          Date.now()
        )}.xlsx`
      );
      setExporting(false);
    } catch (error) {
      reportError(error);
      setExporting(false);
    }

    // track this click for user analytics
    trackEventByName(tracks.clickExportInitiatives.name);
  };

  return (
    <Button
      buttonStyle="text"
      onClick={handleExportInitiatives}
      processing={exporting}
      padding="0"
      fontSize={`${fontSizes.s}px`}
    >
      {exportType === 'all' && (
        <FormattedMessage {...messages.exportInitiatives} />
      )}
      {exportType === 'project' && (
        <FormattedMessage {...messages.exportInitiativesProjects} />
      )}
      {exportType === 'selected_posts' && (
        <FormattedMessage {...messages.exportSelectedInitiatives} />
      )}
    </Button>
  );
};

export default injectIntl(ExportInitiativesButton);
