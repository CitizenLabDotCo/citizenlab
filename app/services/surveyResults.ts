import { API_PATH } from 'containers/App/constants';
import { requestBlob } from 'utils/request';

export const exportSurveyResults = async (
  queryParameter: { type: 'projects' | 'phases', id: string },
  trackingFunction: () => void,
  setExporting: () => void,
  removeExporting: () => void
) => {
  // track this click for user analytics
  trackingFunction();

  try {
    setExporting();
    const blob = await requestBlob(`${API_PATH}/${queryParameter.type}/${queryParameter.id}/survey_responses/as_xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    saveAs(blob, 'survey-results-export.xlsx');
    removeExporting();
  } catch (error) {
    removeExporting();
  }
};
