import React, { useState } from 'react';
import Button from 'components/UI/Button';
import { fontSizes } from 'utils/styleUtils';

// i18n
import messages from '../../messages';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { isString } from 'lodash-es';
import { trackEventByName } from 'utils/analytics';
import { requestBlob } from 'utils/request';
import { API_PATH } from 'containers/App/constants';
import tracks from '../../tracks';
import { exportType } from '../ExportMenu';
import { saveAs } from 'file-saver';
import { InjectedIntlProps } from 'react-intl';

interface Props {
  exportQueryParameter: 'all' | string | string[];
  exportType: exportType;
}

const ExportCommentsButton = ({
  exportQueryParameter: queryParameter,
  exportType,
  intl: { formatDate, formatMessage },
}: Props & InjectedIntlProps) => {
  const [exporting, setExporting] = useState(false);

  const handleExportComments = async () => {
    const queryParametersObject = {};
    if (isString(queryParameter) && queryParameter !== 'all') {
      queryParametersObject['project'] = queryParameter;
    } else if (!isString(queryParameter)) {
      queryParametersObject['initiatives'] = queryParameter;
    }

    try {
      setExporting(true);
      const blob = await requestBlob(
        `${API_PATH}/initiatives/comments/as_xlsx`,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        queryParametersObject
      );
      saveAs(
        blob,
        `${formatMessage(
          messages.initiativesCommentsExportFileName
        )}_${formatDate(Date.now())}.xlsx`
      );
      setExporting(false);
    } catch (error) {
      setExporting(false);
    }

    // track this click for user analytics
    trackEventByName(tracks.clickExportComments.name);
  };

  return (
    <Button
      buttonStyle="text"
      onClick={handleExportComments}
      processing={exporting}
      padding="0"
      fontSize={`${fontSizes.s}px`}
    >
      {exportType === 'all' && (
        <FormattedMessage {...messages.exportInitiativesComments} />
      )}
      {exportType === 'selected_posts' && (
        <FormattedMessage {...messages.exportSelectedInitiativesComments} />
      )}
    </Button>
  );
};

export default injectIntl(ExportCommentsButton);
