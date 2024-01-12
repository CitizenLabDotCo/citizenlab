import { useNode } from '@craftjs/core';
import useGraphDataUnitsPublished from 'api/graph_data_units/useGraphDataUnitsPublished';
import { useReportContext } from 'containers/Admin/reporting/context/ReportContext';

import { useLocation } from 'react-router-dom';
import { isPage } from 'utils/helperUtils';

import { BaseResponseData } from 'utils/cl-react-query/fetcher';
import useGraphDataUnitsLive from './useGraphDataUnitsLive';
import { ParametersLive } from './types';

type Props = ParametersLive & {
  enabled?: boolean;
  onSuccess?: () => void;
};

const useGraphDataUnits = <Response extends BaseResponseData>({
  resolvedName,
  props,
  enabled = true,
  onSuccess,
}: Props) => {
  const { pathname } = useLocation();
  const { id: graphId } = useNode();
  const isAdminPage = isPage('admin', pathname);
  const { reportId } = useReportContext();

  const { data: analyticsLive } = useGraphDataUnitsLive<Response>(
    {
      resolvedName,
      props,
    },
    { enabled: enabled && isAdminPage, onSuccess }
  );

  const { data: analyticsPublished } = useGraphDataUnitsPublished<Response>(
    {
      reportId,
      graphId,
    },
    { enabled: enabled && !isAdminPage }
  );

  const analytics = analyticsLive ?? analyticsPublished;

  return analytics;
};

export default useGraphDataUnits;
