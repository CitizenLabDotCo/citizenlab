import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import { API_PATH } from 'containers/App/constants';

// components
import Button from 'components/UI/Button';

// intl
import { injectIntl } from 'utils/cl-intl';
import messages from '../../messages';
import { InjectedIntlProps } from 'react-intl';

// utils
import { colors } from 'utils/styleUtils';
import { requestBlob } from 'utils/request';
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useInsightsView from 'modules/commercial/insights/hooks/useInsightsView';

import { getInsightsInputsEndpoint } from 'modules/commercial/insights/services/insightsInputs';

type ExportProps = WithRouterProps & InjectedIntlProps;

const Export = ({
  params: { viewId },
  location: { query },
  intl: { formatMessage, formatDate },
}: ExportProps) => {
  const view = useInsightsView(viewId);

  if (isNilOrError(view)) {
    return null;
  }

  const handleExportClick = async () => {
    try {
      const blob = await requestBlob(
        `${API_PATH}/${getInsightsInputsEndpoint(viewId)}/as_xlsx`,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        {
          category: query.category,
          processed:
            query.processed === 'true'
              ? true
              : query.processed === 'false'
              ? false
              : undefined,
        }
      );
      saveAs(
        blob,
        `${formatMessage(messages.inputsTableExportFileName)}_${
          view.attributes.name
        }_${formatDate(Date.now())}.xlsx`
      );
    } catch {
      // Do nothing
    }
  };

  return (
    <Button
      buttonStyle="secondary"
      textColor={colors.adminTextColor}
      onClick={handleExportClick}
    >
      {formatMessage(messages.inputsTableExport)}
    </Button>
  );
};

export default withRouter(injectIntl(Export));
