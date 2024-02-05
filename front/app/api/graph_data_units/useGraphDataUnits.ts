// craft
import { useNode } from '@craftjs/core';
import { useReportContext } from 'containers/Admin/reporting/context/ReportContext';

// routing
import { useLocation, useSearchParams } from 'react-router-dom';
import { isPage } from 'utils/helperUtils';
import { REPORT_BUILDER, EDITOR } from 'containers/Admin/reporting/routes';

// hooks
import useGraphDataUnitsLive from './useGraphDataUnitsLive';
import useGraphDataUnitsPublished from 'api/graph_data_units/useGraphDataUnitsPublished';

// typins
import { BaseResponseData } from 'utils/cl-react-query/fetcher';
import { ParametersLive, Options } from './requestTypes';

const useGraphDataUnits = <Response extends BaseResponseData>(
  parameters: ParametersLive,
  { enabled = true, onSuccess }: Options = { enabled: true }
) => {
  const { pathname } = useLocation();
  const [search] = useSearchParams();

  const { id: graphId } = useNode();
  const { reportId, phaseId } = useReportContext();

  const isAdminPage = isPage('admin', pathname);

  const isReportBuilder =
    isAdminPage &&
    pathname.includes(REPORT_BUILDER) &&
    pathname.endsWith(EDITOR);
  const isReportBuilderPreview =
    isReportBuilder && search.get('preview') === 'true';

  const isPhaseContext = !!phaseId;

  const showLiveData = isPhaseContext
    ? isAdminPage && !isReportBuilderPreview
    : true;

  const { data: dataLive } = useGraphDataUnitsLive<Response>(parameters, {
    enabled: enabled && showLiveData,
    onSuccess,
  });

  const { data: dataPublished } = useGraphDataUnitsPublished<Response>(
    {
      reportId,
      graphId,
    },
    { enabled: enabled && !showLiveData }
  );

  const data = dataLive ?? dataPublished;

  return data;
};

export default useGraphDataUnits;
