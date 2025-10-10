import { useNode } from '@craftjs/core';
import { useLocation, useSearchParams } from 'react-router';

import useGraphDataUnitsPublished from 'api/graph_data_units/useGraphDataUnitsPublished';

import { useReportContext } from 'containers/Admin/reporting/context/ReportContext';
import { reportingEnumRoutes } from 'containers/Admin/reporting/routes';

import { BaseResponseData } from 'utils/cl-react-query/fetcher';
import { isPage } from 'utils/helperUtils';

import { ParametersLive, Options } from './requestTypes';
import useGraphDataUnitsLive from './useGraphDataUnitsLive';

type Params = {
  isPhaseContext: boolean;
  pathname: string;
  hasPreviewParam: boolean;
};

const checkIfLiveDataShouldBeShown = ({
  isPhaseContext,
  pathname,
  hasPreviewParam,
}: Params) => {
  // isPhaseContext is false for global reports,
  // which always use live data
  if (!isPhaseContext) return true;

  const isAdminPage = isPage('admin', pathname);

  const isReportBuilder =
    isAdminPage &&
    pathname.includes(reportingEnumRoutes.reportBuilder) &&
    pathname.endsWith(reportingEnumRoutes.editor);

  if (isReportBuilder) {
    // If we're in the report builder,
    // we show live data unless we're in preview mode
    return !hasPreviewParam;
  }

  const isPhaseReportTab =
    isAdminPage &&
    pathname.includes('projects') &&
    pathname.includes('phases') &&
    pathname.includes('report');

  if (isPhaseReportTab) {
    // In the phase reporting tab, we always
    // show published data for the preview
    return false;
  }

  // If none of the above cases are true,
  // we must be in the front office, and we show published data.
  return false;
};

const useGraphDataUnits = <Response extends BaseResponseData>(
  parameters: ParametersLive,
  { enabled = true, onSuccess }: Options = { enabled: true }
) => {
  const { pathname } = useLocation();
  const [search] = useSearchParams();

  const { id: graphId } = useNode();
  const { reportId, phaseId } = useReportContext();

  const showLiveData = checkIfLiveDataShouldBeShown({
    isPhaseContext: !!phaseId,
    pathname,
    hasPreviewParam: search.get('preview') === 'true',
  });

  const {
    data: dataLive,
    error: errorLive,
    isLoading: isLoadingLive,
  } = useGraphDataUnitsLive<Response>(parameters, {
    enabled: enabled && showLiveData,
    onSuccess,
  });

  const {
    data: dataPublished,
    error: errorPublished,
    isLoading: isLoadingPublished,
  } = useGraphDataUnitsPublished<Response>(
    {
      reportId,
      graphId,
    },
    { enabled: enabled && !showLiveData }
  );

  const data = showLiveData ? dataLive : dataPublished;
  const error = showLiveData ? errorLive : errorPublished;
  const isLoading = showLiveData ? isLoadingLive : isLoadingPublished;

  return { data, error, isLoading };
};

export default useGraphDataUnits;
