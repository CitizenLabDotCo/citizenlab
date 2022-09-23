import { API_PATH } from 'containers/App/constants';
import { saveAs } from 'file-saver';
import React from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// components
import Button from 'components/UI/Button';

// intl
import { injectIntl, WrappedComponentProps } from 'react-intl';
import messages from '../../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { requestBlob } from 'utils/request';
import { colors } from 'utils/styleUtils';

// hooks
import useInsightsView from 'modules/commercial/insights/hooks/useInsightsView';

// services
import { getInsightsInputsEndpoint } from 'modules/commercial/insights/services/insightsInputs';

type ExportProps = WithRouterProps & WrappedComponentProps;

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
          categories:
            typeof query.category === 'string' ? [query.category] : undefined,
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
          view.data.attributes.name
        }_${formatDate(Date.now())}.xlsx`
      );
    } catch {
      // Do nothing
    }
  };

  return (
    <div data-testid="insightsExport">
      <Button
        buttonStyle="secondary"
        textColor={colors.adminTextColor}
        onClick={handleExportClick}
      >
        {formatMessage(messages.inputsTableExport)}
      </Button>
    </div>
  );
};

export default withRouter(injectIntl(Export));
