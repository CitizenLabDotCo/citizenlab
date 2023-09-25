import React from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { API_PATH } from 'containers/App/constants';
import { saveAs } from 'file-saver';

// components
import Button from 'components/UI/Button';
import { Box } from '@citizenlab/cl2-component-library';

// intl
import { injectIntl } from 'utils/cl-intl';
import messages from '../../messages';
import { WrappedComponentProps } from 'react-intl';

// utils
import { colors } from 'utils/styleUtils';
import { requestBlob } from 'utils/requestBlob';
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useView from 'modules/commercial/insights/api/views/useView';

// services

type ExportProps = WithRouterProps & WrappedComponentProps;

const Export = ({
  params: { viewId },
  location: { query },
  intl: { formatMessage, formatDate },
}: ExportProps) => {
  const { data: view } = useView(viewId);

  if (isNilOrError(view)) {
    return null;
  }

  const handleExportClick = async () => {
    try {
      const blob = await requestBlob(
        `${API_PATH}/insights/views/${viewId}/inputs/as_xlsx`,
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
