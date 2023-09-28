import React from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { API_PATH } from 'containers/App/constants';
import { saveAs } from 'file-saver';

// components
import Button from 'components/UI/Button';

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
        textColor={colors.primary}
        onClick={handleExportClick}
      >
        {formatMessage(messages.inputsTableExport)}
      </Button>
    </div>
  );
};

export default withRouter(injectIntl(Export));
