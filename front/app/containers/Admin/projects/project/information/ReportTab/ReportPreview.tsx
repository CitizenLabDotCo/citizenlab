import React from 'react';

// hooks
import useReport from 'api/reports/useReport';

interface Props {
  reportId: string;
}

const ReportPreview = ({ reportId }: Props) => {
  const { data: report } = useReport(reportId);

  return <div>{report?.data.attributes.name}</div>;
};

export default ReportPreview;
