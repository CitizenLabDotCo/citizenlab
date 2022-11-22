import { API_PATH } from 'containers/App/constants';
import { saveAs } from 'file-saver';
import React from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// intl
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
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
            typeof query.categories === 'string'
              ? [query.categories]
              : query.categories,
          keywords:
            typeof query.keywords === 'string'
              ? [query.keywords]
              : query.keywords,
        }
      );
      saveAs(
        blob,
        `${formatMessage(messages.inputsListExportFileName)}_${
          view.data.attributes.name
        }_${formatDate(Date.now())}.xlsx`
      );
    } catch {
      // Do nothing
    }
  };

  return (
    <Box data-testid="insightsExport" display="flex" justifyContent="flex-end">
      <Button
        className="intercom-insights-network-export-all-button"
        buttonStyle="text"
        textColor={colors.textSecondary}
        onClick={handleExportClick}
      >
        {formatMessage(messages.inputsListExportButton)}
      </Button>
    </Box>
  );
};

export default withRouter(injectIntl(Export));
