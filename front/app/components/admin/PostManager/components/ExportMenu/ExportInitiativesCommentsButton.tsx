import Button from 'components/UI/Button';
import React, { useState } from 'react';
import { fontSizes } from 'utils/styleUtils';

// i18n
import { API_PATH } from 'containers/App/constants';
import { saveAs } from 'file-saver';
import { isString } from 'lodash-es';
import { WrappedComponentProps } from 'react-intl';
import { trackEventByName } from 'utils/analytics';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { requestBlob } from 'utils/request';
import messages from '../../messages';
import tracks from '../../tracks';
import { exportType } from '../ExportMenu';

interface Props {
  exportQueryParameter: 'all' | string | string[];
  exportType: exportType;
}

const ExportCommentsButton = ({
  exportQueryParameter: queryParameter,
  exportType,
  intl: { formatDate, formatMessage },
}: Props & WrappedComponentProps) => {
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
