import { useNode } from '@craftjs/core';
import useGraphDataUnitsPublished from 'api/graph_data_units/useGraphDataUnitsPublished';
import { useReportContext } from 'containers/Admin/reporting/context/ReportContext';

import { useLocation } from 'react-router-dom';
import { isPage } from 'utils/helperUtils';

import { BaseResponseData } from 'utils/cl-react-query/fetcher';
import useGraphDataUnitsLive from './useGraphDataUnitsLive';
import { ParametersLive, Options } from './requestTypes';

const useGraphDataUnits = <Response extends BaseResponseData>(
  parameters: ParametersLive,
  { enabled = true, onSuccess }: Options = { enabled: true }
) => {
  const { pathname } = useLocation();
  const { id: graphId } = useNode();
  const isAdminPage = isPage('admin', pathname);
  const { reportId } = useReportContext();

  const { data: dataLive } = useGraphDataUnitsLive<Response>(parameters, {
    enabled: enabled && isAdminPage,
    onSuccess,
  });

  const { data: dataPublished } = useGraphDataUnitsPublished<Response>(
    {
      reportId,
      graphId,
    },
    { enabled: enabled && !isAdminPage }
  );

  const data = dataLive ?? dataPublished;

  return data;
};

export default useGraphDataUnits;
